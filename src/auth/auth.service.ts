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
import { RoleType } from '../role/types/role.type';
import { RoleService } from '../role/role.service';
import { ApplicationService } from '../office/application.service';
import { ChatGateway } from '../chat/chat.gateway';
import { EmailService } from '../mail/email.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly s3Service: S3Service,
    private readonly userService: UserService,
    private readonly officeService: OfficeService,
    private readonly applicationService: ApplicationService,
    private readonly roleService: RoleService,
    private readonly chatGateway: ChatGateway,
    private readonly emailService: EmailService,
    private readonly redisService: RedisService,
  ) {}

  async findUserById(id: User['id']) {
    return await this.userService.findOneById(id);
  }

  async findUserByEmail(email: string) {
    return await this.userService.findOneByEmail(email);
  }

  async findRole(name: RoleType) {
    return await this.roleService.find(name);
  }

  async hashPassword(password: string) {
    const salt = 10;
    return await bcrypt.hash(password, salt);
  }

  async findOfficeOwnerById(officeId: Office['id']) {
    return await this.officeService.findOneById(officeId);
  }

  async createEmail(email: User['email'], subject: string, content: string) {
    this.emailService.sendEmail(email, subject, content);
  }

  async sendNotice(requester: User, owner: User) {
    const subject = `[진실을찾는사람들] 오피스 직원 승인 요청`;
    const content = `${requester.name}(${requester.email})님께서 귀사의 직원 계정 등록을 요청하셨습니다. 페이지로 이동하여 알림을 확인해주세요.`;
    await this.createEmail(owner.email, subject, content);
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
    const role = await this.findRole(RoleType.USER);
    const hashedPassword = await this.hashPassword(dto.password);
    return await queryRunner.manager.getRepository(User).save({
      ...dto,
      password: hashedPassword,
      role,
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

  createApplicaiton(requester: Detective, office: Office) {
    return this.applicationService.create(requester, office);
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
      // 신청서 생성 및 신청 알림 발송
      const office = await this.findOfficeOwnerById(dto.officeId);
      const owner = office.owner;
      this.createApplicaiton(detective, office);
      await this.sendNotice(user, owner);

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
  async validationCheckBno(
    b_no: Office['businessNum'],
    start_dt: Office['founded'],
    p_nm: Office['name'],
  ) {
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
      body: JSON.stringify(data),
    };

    try {
      const request = await fetch(url, option)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          const status = data.status_code;
          if (status !== 'OK') {
            throw new BadRequestException('사업자등록진위여부 요청이 잘못 되었습니다.');
          }
          const validation = data.data[0].valid;
          if (validation === '02') {
            throw new Error('등록되지 않은 사업자번호입니다.');
          }
        });
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
