import { ConflictException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { UserService } from '../user/user.service';
import { DataSource } from 'typeorm';
import { hash } from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { CreateConsumerAuthDto } from './dto/create-consumer-auth.dto';
import { CreateDetectiveAuthDto } from './dto/create-detective-auth.dto';
import { Detective } from '../user/entities/detective.entity';
import { Position } from './type/position-enum.type';
import { Location } from '../detectiveoffice/entities/location.entity';
import { DetectiveOffice } from '../detectiveoffice/entities/detective-office.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
    private readonly httpService: HttpService,
  ) {}
  async createConsumer(createConsumerAuthDto: CreateConsumerAuthDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const userExistence = await this.userService.findByEmail(createConsumerAuthDto.email);

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
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createDetective(createDetectiveAuthDto: CreateDetectiveAuthDto, fileId) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const userExistence = await this.userService.findByEmail(createDetectiveAuthDto.email);

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

      if ((createDetectiveAuthDto.position = Position.Employee)) {
        const detective = await this.dataSource.manager.getRepository(Detective).save({
          userId: user.id,
          gender: createDetectiveAuthDto.gender,
          position: createDetectiveAuthDto.position,
        });
      }

      if ((createDetectiveAuthDto.position = Position.Employer)) {
        const businessInfo = await this.registrationVerify(
          createDetectiveAuthDto.businessNumber,
          createDetectiveAuthDto.founded,
          user.name,
        );

        const location = await queryRunner.manager.getRepository(Location).save({
          address: createDetectiveAuthDto.address,
        });

        const office = await queryRunner.manager.getRepository(DetectiveOffice).save({
          ownerId: user.id,
          businessRegistrationNum: businessInfo.request_param.b_no,
          founded: businessInfo.request_param.start_dt,
          locationId: location.id,
        });

        const detective = await queryRunner.manager.getRepository(Detective).save({
          userId: user.id,
          officeId: office.id,
          gender: createDetectiveAuthDto.gender,
          position: createDetectiveAuthDto.position,
          business_registration_file_id: fileId,
        });
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

  async registrationVerify(b_no: number, start_dt: number, p_nm: string) {
    const SERVICE_KEY = process.env.BUSINESS_REGISTRATION_SERVICEKEY;
    const url: any = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${SERVICE_KEY}&b_no=${b_no}&start_dt=${start_dt}&p_nm=${p_nm}`;

    try {
      const response = await this.httpService.get(url).toPromise();
      return response.data;
    } catch (error) {
      throw new Error('Error fetching business info');
    }
  }
}
