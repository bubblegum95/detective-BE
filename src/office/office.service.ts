import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from 'src/mail/email.service';
import { Office } from './entities/office.entity';
import { CreateOfficeDto } from './dto/create-office.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class OfficeService {
  constructor(
    @InjectRepository(Office)
    private officeRepo: Repository<Office>,
    private emailService: EmailService,
  ) {}
  // 오피스 생성
  async create(owner: User, dto: CreateOfficeDto) {
    return await this.officeRepo.save({ ...dto, owner });
  }

  // 이름 검색
  async findByName(name: string, take: number, skip: number) {
    return await this.officeRepo
      .createQueryBuilder('office')
      .where('office.name LIKE :name', { name: `%${name}%` })
      .getMany();
  }

  async findByNameWithDetective(name: string, take: number, skip: number) {
    return await this.officeRepo
      .createQueryBuilder('office')
      .leftJoinAndSelect('office.employees', 'e')
      .leftJoinAndSelect('e.detective', 'd')
      .where('office.name LIKE :name', { name: `%${name}%` })
      .skip(skip)
      .take(take)
      .getMany();
  }

  // 야이디 검색
  async findOneById(id: number) {
    return await this.officeRepo.findOne({
      where: { id },
      relations: ['owner', 'location', 'employees'],
    });
  }

  // 오피스 직원 신청 알람
  async requestRegistration(id: number, user: User) {
    const office = await this.findOneById(id);
    const owner = office.owner;
    const subject = `[진실을찾는사람들] 오피스 직원 계정 등록 요청`;
    const content = `${user.name}(${user.email})님께서 귀사의 직원 계정 등록을 요청하셨습니다. 페이지로 이동하여 알림을 확인해주세요.`;
    this.emailService.sendEmail(owner.email, subject, content);
  }
}
