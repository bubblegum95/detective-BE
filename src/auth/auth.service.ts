import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { CreateConsumerAuthDto } from './dto/consumer-signup.dto';
import { CreateDetectiveAuthDto } from './dto/detective-signup.dto';
import { Detective } from '../user/entities/detective.entity';
import { Position } from './type/position-enum.type';
import { Location } from '../detectiveoffice/entities/location.entity';
import { DetectiveOffice } from '../detectiveoffice/entities/detective-office.entity';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  async existedEmail(email) {
    try {
      const foundEmail = await this.userRepository.findOneBy(email);
      console.log('foundEmail');
      return foundEmail;
    } catch (error) {
      console.error(error.message);
    }
  }

  async validateUser({ email, password }: SignInDto) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true },
    });

    const isPasswordMatched = bcrypt.compareSync(password, user?.password ?? '');

    if (!user || !isPasswordMatched) {
      throw new UnauthorizedException('일치하는 회원정보가 없습니다');
    }

    return user.id;
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

  async createDetective(createDetectiveAuthDto: CreateDetectiveAuthDto, fileId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const userExistence = await this.existedEmail(createDetectiveAuthDto.email);

    if (userExistence) {
      await queryRunner.release();
      throw new ConflictException('해당 이메일로 가입된 사용자가 있습니다.');
    }

    if (createDetectiveAuthDto.password !== createDetectiveAuthDto.passwordConfirm) {
      await queryRunner.release();
      throw new ConflictException('비밀번호와 확인용 비밀번호가 서로 일치하지 않습니다.');
    }

    try {
      const hashedPassword = await hash(createDetectiveAuthDto.password, 10);

      const user = await queryRunner.manager.getRepository(User).save({
        email: createDetectiveAuthDto.email,
        name: createDetectiveAuthDto.name,
        password: hashedPassword,
        nickname: createDetectiveAuthDto.nickname,
        phoneNumber: createDetectiveAuthDto.phoneNumber,
      });

      if (createDetectiveAuthDto.position === Position.Employee) {
        await this.dataSource.manager.getRepository(Detective).save({
          userId: user.id,
          gender: createDetectiveAuthDto.gender,
          position: createDetectiveAuthDto.position,
        });
      }

      if (createDetectiveAuthDto.position === Position.Employer) {
        // 사업자 등록 정보 검증
        const validateBusiness = await this.validationCheckBno(
          createDetectiveAuthDto.businessNumber,
          createDetectiveAuthDto.founded,
          user.name,
        );

        if (!validateBusiness) {
          throw new UnauthorizedException('사업자 등록 정보가 없거나 올바르지 않습니다');
        }

        if (validateBusiness.data[0].tax_type === '국세청에 등록되지 않은 사업자등록번호입니다.') {
          throw new BadRequestException('국세청에 등록되지 않은 사업자등록번호입니다.');
        }

        // location 등록
        const location = await queryRunner.manager.getRepository(Location).save({
          address: createDetectiveAuthDto.address,
        });

        // office 등록
        const office = await queryRunner.manager.getRepository(DetectiveOffice).save({
          ownerId: user.id,
          businessRegistrationNum: createDetectiveAuthDto.businessNumber,
          founded: createDetectiveAuthDto.founded,
          locationId: location.id,
        });

        if (!office) {
          throw new BadRequestException('office create error');
        }

        // detective 등록
        const detective = await queryRunner.manager.getRepository(Detective).save({
          userId: user.id,
          officeId: office.id,
          gender: createDetectiveAuthDto.gender,
          position: createDetectiveAuthDto.position,
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

    try {
      const response = await fetch(url, option);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const result = await response.json();
      console.log(result);
      return result;
    } catch (error) {
      console.error('Error:', error.message); // 에러 메시지 확인
      return null;
    }
  }

  async signIn(signInDto: SignInDto) {
    try {
      const { email, password } = signInDto;
      const user = await this.validateUser({ email, password });

      if (!user) {
        throw new UnauthorizedException('일치하는 인증 정보가 없습니다');
      }

      const payload = { id: user };
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
