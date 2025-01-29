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
import { DetectiveOffice } from '../office/entities/detective-office.entity';
import { Location } from '../office/entities/location.entity';
import { UserService } from '../user/user.service';
import { CreateDetectiveEmployeeAuthDto } from './dto/detective-employee-signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly s3Service: S3Service,
    private readonly userService: UserService,
  ) {}

  async existedEmail(email: string) {
    const foundEmail: User | null = await this.userService.findUserbyEmail(email);
    return foundEmail;
  }

  async existedUserId(userId: number) {
    try {
      const foundUser = await this.userService.findUserbyId(userId);

      return foundUser;
    } catch (error) {
      throw error;
    }
  }

  async validateUser(dto: SignInDto): Promise<{ id: number; email: string; password: string }> {
    try {
      const user = await this.userService.findUser(dto.email);
      if (!user) {
        throw new UnauthorizedException('일치하는 회원정보가 없습니다.');
      }

      const isPasswordMatched = bcrypt.compareSync(dto.password, user.password ?? '');
      if (!isPasswordMatched) {
        throw new BadRequestException('비밀번호가 일치하지 않습니다.');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async createUserInfo(queryRunner, name, email, nickname, phoneNumber, password) {
    const hashedPassword = await hash(password, 10);
    const user = await queryRunner.manager.getRepository(User).save({
      email: email,
      name: name,
      password: hashedPassword,
      nickname: nickname,
      phoneNumber: phoneNumber,
    });

    return user;
  }

  async createDetectiveInfo(dto) {
    if (dto.position === Position.Employee) {
      const detective = await dto.queryRunner.manager.getRepository(Detective).save({
        userId: dto.userId,
        gender: dto.gender,
        position: dto.position,
      });

      return detective;
    } else if (dto.position === Position.Employer) {
      const detective = await dto.queryRunner.manager.getRepository(Detective).save({
        userId: dto.userId,
        officeId: dto.officeId,
        gender: dto.gender,
        position: dto.position,
        business_registration_file_id: dto.fileId,
      });

      return detective;
    }
  }

  async createOfficeInfo(dto) {
    const office = await dto.queryRunner.manager.getRepository(DetectiveOffice).save({
      ownerId: dto.ownerId,
      name: dto.name,
      businessRegistrationNum: dto.businessRegistrationNum,
      founded: dto.founded,
      locationId: dto.locationId,
    });

    return office;
  }

  async createBusinessAddress(dto) {
    const location = await dto.queryRunner.manager.getRepository(Location).save({
      address: dto.address,
    });
    return location;
  }

  async createConsumer(createConsumerAuthDto: CreateConsumerAuthDto) {
    const { email, name, password, nickname, phoneNumber } = createConsumerAuthDto;

    if (createConsumerAuthDto.password !== createConsumerAuthDto.passwordConfirm) {
      throw new ConflictException('비밀번호와 재입력된 비밀번호가 서로 일치하지 않습니다.');
    }

    const userExistence = await this.existedEmail(createConsumerAuthDto.email);

    if (userExistence) {
      throw new ConflictException('해당 이메일로 가입된 사용자가 있습니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.createUserInfo(
        queryRunner,
        name,
        email,
        nickname,
        phoneNumber,
        password,
      );

      if (!user) {
        throw new BadRequestException(
          '사용자 정보 생성에 실패했습니다. 회원가입을 다시 진행해주세요.',
        );
      }

      await queryRunner.commitTransaction();
      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createDetectiveWithNoFile(createDetectiveEmployeeAuthDto: CreateDetectiveEmployeeAuthDto) {
    const { name, email, nickname, phoneNumber, password, passwordConfirm, gender } =
      createDetectiveEmployeeAuthDto;

    if (password !== passwordConfirm) {
      throw new ConflictException('비밀번호와 재입력된 비밀번호가 서로 일치하지 않습니다.');
    }

    const userExistence = await this.existedEmail(email);

    if (userExistence) {
      throw new ConflictException('해당 이메일로 가입된 사용자가 있습니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.createUserInfo(
        queryRunner,
        name,
        email,
        nickname,
        phoneNumber,
        password,
      );

      if (!user) {
        throw new BadRequestException(
          '사용자 정보 생성에 실패했습니다. 회원가입을 다시 진행해주세요.',
        );
      }

      const detectiveDto = {
        queryRunner,
        userId: user.id,
        gender: gender,
        position: Position.Employee,
      };

      const detectiveInfo = await this.createDetectiveInfo(detectiveDto);

      if (!detectiveInfo) {
        throw new BadRequestException(
          '탐정 정보 생성에 실패했습니다. 회원가입을 다시 진행해주세요.',
        );
      }

      await queryRunner.commitTransaction();

      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
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
      address,
      businessNumber,
      founded,
      company,
    } = createDetectiveAuthDto;

    if (password !== passwordConfirm) {
      throw new ConflictException('비밀번호와 재입력된 비밀번호가 서로 일치하지 않습니다.');
    }

    const userExistence = await this.existedEmail(email);

    if (userExistence) {
      throw new ConflictException('해당 이메일로 가입된 사용자가 있습니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 사용자 정보 생성
      const user = await this.createUserInfo(
        queryRunner,
        name,
        email,
        nickname,
        phoneNumber,
        password,
      );

      if (!user) {
        throw new BadRequestException(
          '사용자 정보 생성에 실패했습니다. 회원가입을 다시 진행해주세요.',
        );
      }

      // 사업자 등록 정보 검증
      const validateBusiness = await this.validationCheckBno(businessNumber, founded, name);

      if (!validateBusiness) {
        throw new BadRequestException(
          '사업자 정보를 확인할 수 없습니다. 입력하신 정보를 확인해주세요.',
        );
      }

      // location 등록
      const locationInfo = {
        queryRunner,
        address,
      };

      const location = await this.createBusinessAddress(locationInfo);

      if (!location) {
        throw new BadRequestException('사업장 등록을 실패했습니다.');
      }

      // office 등록
      const officeInfo = {
        queryRunner,
        ownerId: user.id,
        name: company,
        businessRegistrationNum: businessNumber,
        founded: founded,
        locationId: location.id,
      };

      const office = await this.createOfficeInfo(officeInfo);
      if (!office) {
        throw new BadRequestException('office create error: 회원가입 정보를 다시 입력해주세요.');
      }

      const path = await this.s3Service.uploadFileToS3('registration', file);
      const savedFile = await this.s3Service.savePath(path);
      if (!savedFile) {
        throw new BadRequestException('등록된 사업자등록증 이미지 파일이 존재하지 않습니다.');
      }

      // detective 등록
      const detectiveDto = {
        queryRunner,
        userId: user.id,
        officeId: office.id,
        gender: gender,
        position: Position.Employer,
        business_registration_file_id: savedFile,
      };

      const detectiveInfo = await this.createDetectiveInfo(detectiveDto);

      if (!detectiveInfo) {
        throw new BadRequestException(
          '탐정 정보 생성에 실패했습니다. 회원가입을 다시 진행해주세요.',
        );
      }

      await queryRunner.commitTransaction();

      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 사업자 등록 정보 검증
  async validationCheckBno(b_no: string, start_dt: string, p_nm: string) {
    console.log(p_nm);
    const data = {
      businesses: [
        {
          b_no: b_no,
          start_dt: start_dt,
          p_nm: p_nm,
          p_nm2: '',
          b_nm: '',
          corp_no: '',
          b_sector: '',
          b_type: '',
          b_adr: '',
        },
      ],
    };

    const SERVICE_KEY = process.env.BUSINESS_REGISTRATION_SERVICEKEY;
    const url = `https://api.odcloud.kr/api/nts-businessman/v1/validate?serviceKey=${SERVICE_KEY}`;
    const option = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data), // JSON을 string으로 변환하여 전송
    };

    try {
      const response = fetch(url, option)
        .then((a) => a.json())
        .then((data) => {
          const validation = data.data[0].valid;

          if (validation === '02') {
            throw new Error('등록되지 않은 사업자번호입니다.');
          }
        });

      console.log('사업자등록진위여부결과: ', response);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // 로그인
  async signIn(signInDto: SignInDto) {
    try {
      const user = await this.validateUser(signInDto);
      if (!user) {
        throw new UnauthorizedException('토큰을 발급할 수 없습니다.');
      }

      const payload = { id: user.id };
      const options = {
        secret: process.env.ACCESS_SECRET,
        expiresIn: '7d',
      };
      const accessToken = this.jwtService.sign(payload, options);

      return accessToken;
    } catch (error) {
      throw error;
    }
  }

  // 테스트
  // async saveNotification(data: any, room: string) {
  //   if (data.type === NotificationType.Message) {
  //     const roomMembers = await this.dataSource
  //       .getRepository(Room)
  //       .createQueryBuilder('room')
  //       .select(['room.name', 'user.id'])
  //       .leftJoin('room.user', 'user')
  //       .where('room.name = :roomName', { roomName: 'd9b383f3-53ca-45db-a806-c3aabfd78fb3' }) // 변수 사용
  //       .getOne(); // findOne()과 유사한 메서드

  //     const members = roomMembers.users;
  //     const memberList: number[] = [];

  //     for (const member of members) {
  //       memberList.push(Number(member.id));
  //     }
  //     console.log(memberList);

  //     return memberList;
  //   } else if (data.type === NotificationType.Onboarding) {
  //   }
  // }
}
