import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';
import { S3Service } from '../s3/s3.service';
import { UserService } from '../user/user.service';
import { Office } from '../office/entities/office.entity';
import { Detective } from '../detective/entities/detective.entity';
import { File } from '../s3/entities/s3.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateOfficeDto } from './dto/create-office.dto';
import { CreateEmployerDto } from './dto/create-employer.dto';
import { OfficeService } from '../office/office.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly s3Service: S3Service,
    private readonly userService: UserService,
    private readonly officeService: OfficeService,
  ) {}

  async findUserByEmail(email: string) {
    return await this.userService.findOneByEmail(email);
  }

  async findUserById(userId: number) {
    return await this.userService.findOneById(userId);
  }

  async hashPassword(password: string) {
    const salt = 10;
    return await bcrypt.hash(password, salt);
  }

  async validateUser(dto: SignInDto): Promise<User> {
    try {
      const user = await this.findUserByEmail(dto.email);
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

  async createUser(queryRunner: QueryRunner, dto: CreateUserDto) {
    const hashedPassword = await this.hashPassword(dto.password);
    return await queryRunner.manager.getRepository(User).save({
      ...dto,
      password: hashedPassword,
    });
  }

  async createDetective(
    queryRunner: QueryRunner,
    dto: { user: User; office?: Office },
  ): Promise<Detective> {
    return await queryRunner.manager.getRepository(Detective).save({
      ...dto,
    });
  }

  async createOffice(queryRunner: QueryRunner, dto: CreateOfficeDto) {
    return await queryRunner.manager.getRepository(Office).save({
      ...dto,
    });
  }

  async createFile(queryRunner: QueryRunner, dto: { office: Office; path: string }): Promise<File> {
    return queryRunner.manager.getRepository(File).save({ ...dto });
  }

  async createConsumer(dto: {
    name: string;
    nickname: string;
    email: string;
    password: string;
    phoneNumber: string;
  }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      return await this.createUser(queryRunner, dto);
    } catch (error) {
      throw error;
    }
  }

  async createEmployee(dto: CreateEmployeeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.createUser(queryRunner, dto.user);
      const detective = await this.createDetective(queryRunner, { user });
      if (!detective) {
        throw new ConflictException('탐정 계정을 생성할 수 없습니다.');
      }
      await queryRunner.commitTransaction();
      await this.officeService.requestRegistration(dto.officeId, user);

      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createEmployer(dto: CreateEmployerDto, path: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 사용자
      const owner = await this.createUser(queryRunner, dto.user);
      // 오피스
      const office = await this.createOffice(queryRunner, { ...dto.office, owner });
      // 파일
      const file = await this.createFile(queryRunner, { path, office });
      // 탐정
      const detective = await this.createDetective(queryRunner, { user: owner, office });
      if (!detective) {
        throw new ConflictException('탐정 계정을 생성할 수 없습니다.');
      }
      await queryRunner.commitTransaction();
      return owner;
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
}
