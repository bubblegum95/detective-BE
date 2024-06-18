import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { hash } from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { CreateConsumerAuthDto } from './dto/consumer-signup.dto';
import { CreateDetectiveAuthDto } from './dto/detective-signup.dto';
import { Detective } from '../user/entities/detective.entity';
import { Position } from './type/position-enum.type';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';
import { S3Service } from '../s3/s3.service';
import { DetectiveOffice } from 'src/office/entities/detective-office.entity';
import { Location } from 'src/office/entities/location.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly s3Service: S3Service,
    private readonly userService: UserService,
  ) {}

  async existedEmail(email: string) {
    try {
      const foundEmail = await this.userService.findUserbyEmail(email);
      console.log('foundEmail');
      return foundEmail;
    } catch (error) {
      console.error(error.message);
    }
  }

  async existedUserId(userId: number) {
    try {
      const foundUser = await this.userService.findUserbyId(userId);

      return foundUser;
    } catch (error) {
      console.error(error.message);
    }
  }

  async validateUser({ email, password }: SignInDto) {
    const user = await this.userService.findUser(email, password);
    const isPasswordMatched = bcrypt.compareSync(password, user?.password ?? '');

    if (!user || !isPasswordMatched) {
      throw new UnauthorizedException('일치하는 회원정보가 없습니다');
    }

    return user;
  }

  async createConsumer(createConsumerAuthDto: CreateConsumerAuthDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const userExistence = await this.existedEmail(createConsumerAuthDto.email);

    if (userExistence) {
      await queryRunner.release();
      throw new ConflictException('해당 이메일로 가입된 사용자가 있습니다.');
    }

    if (createConsumerAuthDto.password !== createConsumerAuthDto.passwordConfirm) {
      await queryRunner.release();
      throw new ConflictException('비밀번호와 확인용 비밀번호가 서로 일치하지 않습니다.');
    }

    try {
      const hashedPassword = await hash(createConsumerAuthDto.password, 10);

      const user = await queryRunner.manager.getRepository(User).save({
        email: createConsumerAuthDto.email,
        name: createConsumerAuthDto.name,
        password: hashedPassword,
        nickname: createConsumerAuthDto.nickname,
        phoneNumber: createConsumerAuthDto.phoneNumber,
      });

      await queryRunner.commitTransaction();

      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async createDetective(
    createDetectiveAuthDto: CreateDetectiveAuthDto,
    file: Express.Multer.File | null,
  ) {
    const {
      name,
      email,
      nickname,
      phoneNumber,
      password,
      passwordConfirm,
      gender,
      position,
      address,
      businessNumber,
      founded,
    } = createDetectiveAuthDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const userExistence = await this.existedEmail(email);

    if (userExistence) {
      await queryRunner.release();
      throw new ConflictException('해당 이메일로 가입된 사용자가 있습니다.');
    }

    if (password !== passwordConfirm) {
      await queryRunner.release();
      throw new ConflictException('비밀번호와 확인용 비밀번호가 서로 일치하지 않습니다.');
    }

    try {
      const hashedPassword = await hash(password, 10);

      const user = await queryRunner.manager.getRepository(User).save({
        email: email,
        name: name,
        password: hashedPassword,
        nickname: nickname,
        phoneNumber: phoneNumber,
      });

      if (position === Position.Employee) {
        await this.dataSource.manager.getRepository(Detective).save({
          userId: user.id,
          gender: gender,
          position: position,
        });
      }

      if (position === Position.Employer) {
        // 사업자 등록 정보 검증
        const validateBusiness = await this.validationCheckBno(businessNumber, founded, user.name);

        if (!validateBusiness) {
          throw new UnauthorizedException('사업자 등록 정보가 없거나 올바르지 않습니다');
        }

        if (!validateBusiness.ok) {
          const errorText = await validateBusiness.text();
          throw new Error(errorText);
        }

        const result = await validateBusiness.json();
        console.log(result);

        if (founded !== result.data[0].b_stt) {
          throw new UnauthorizedException('설립일자가 일치하지 않습니다.');
        }

        if (result.data[0].tax_type === '국세청에 등록되지 않은 사업자등록번호입니다.') {
          throw new BadRequestException('국세청에 등록되지 않은 사업자등록번호입니다.');
        }
        // location 등록
        const location = await queryRunner.manager.getRepository(Location).save({
          address: address,
        });

        // office 등록
        const office = await queryRunner.manager.getRepository(DetectiveOffice).save({
          ownerId: user.id,
          businessRegistrationNum: businessNumber,
          founded: founded,
          locationId: location.id,
        });

        if (!office) {
          throw new BadRequestException('office create error');
        }

        const fileId = await this.s3Service.uploadRegistrationFile(file);

        // detective 등록
        const detective = await queryRunner.manager.getRepository(Detective).save({
          userId: user.id,
          officeId: office.id,
          gender: gender,
          position: position,
          business_registration_file_id: fileId,
        });

        if (!detective) {
          throw new UnauthorizedException('detective create error');
        }
      }

      await queryRunner.commitTransaction();

      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error.message);
      error.message;
    } finally {
      await queryRunner.release();
    }
  }

  // 사업자 등록 정보 검증
  async validationCheckBno(b_no: string, start_dt: string, p_nm: string) {
    const data = {
      b_no: [b_no],
      start_dt: [start_dt],
      p_nm: [p_nm],
      p_nm2: '',
      b_nm: '',
      corp_no: '',
      b_sector: '',
      b_type: '',
      b_adr: '',
    };

    const SERVICE_KEY = process.env.BUSINESS_REGISTRATION_SERVICEKEY;
    const url = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${SERVICE_KEY}`;
    const option = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data), // JSON을 string으로 변환하여 전송
    };

    const response = await fetch(url, option);

    return response;
  }

  // 로그인
  async signIn(signInDto: SignInDto) {
    try {
      const { email, password } = signInDto;
      const user = await this.validateUser({ email, password });

      if (!user) {
        throw new UnauthorizedException('일치하는 회원 정보가 없습니다');
      }

      const payload = { id: user.id };
      const accessToken = this.jwtService.sign(payload, {
        secret: process.env.ACCESS_SECRET,
        expiresIn: '7d',
      });

      return accessToken;
    } catch (error) {
      return console.error(error.message);
    }
  }
}
