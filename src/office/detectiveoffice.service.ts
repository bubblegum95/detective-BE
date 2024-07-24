import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Detective } from 'src/user/entities/detective.entity';
import { Repository } from 'typeorm';
import { DetectiveOffice } from './entities/detective-office.entity';
import { OfficeRelationship } from './entities/office-relationship.entity';
import { UserService } from 'src/user/user.service';
import { EmailService } from 'src/mail/email.service';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class DetectiveofficeService {
  constructor(
    @Inject('REDIS_SERVICE') private client: ClientProxy,
    @InjectRepository(Detective)
    private detectiveRepo: Repository<Detective>,
    @InjectRepository(DetectiveOffice)
    private officeRepo: Repository<DetectiveOffice>,
    private emailService: EmailService,
    private userService: UserService,
    @InjectRepository(OfficeRelationship)
    private officeRelationshipRepo: Repository<OfficeRelationship>,
  ) {}

  async findOfficeByKeyword(key: string) {
    const offices = await this.officeRepo.find({ where: { name: key } });
    return offices;
  }

  // 오피스 등록 요청
  async requestRegistration(key: string, userId: number) {
    const office = await this.findOfficeByKeyword(key);

    if (office.length === 0) {
      return { message: '해당 키워드로 오피스를 찾을 수 없습니다.' };
    }

    const officeId = office[0].id;

    const officeDetails = await this.officeRepo.findOne({
      where: { id: officeId },
      relations: ['detective', 'detective.user'],
    });

    const requestingUser = await this.userService.findOneById(userId);

    const ownerEmail = officeDetails.detective.user.email;
    const subject = '오피스 등록 요청';
    // 나중에 수락 링크 연동되게끔
    const text = `오피스 등록 요청이 있습니다. 요청자: ${requestingUser.name}`;

    await this.emailService.sendEmail(ownerEmail, subject, text);

    return { message: '등록 요청이 완료되었습니다.' };
  }

  // 오피스 등록 수락
  async approveRegistration(officeId: number, email: string, userId: number) {
    const office = await this.officeRepo.findOneBy({ id: officeId });

    if (!office) {
      throw new Error('해당 오피스를 찾을 수 없습니다.');
    }

    const employer = await this.userService.findOneById(userId);

    if (!employer) {
      throw new Error('존재하지 않는 고용인입니다.');
    }
    const employee = await this.userService.findUserbyEmail(email);

    const officeRelationship = await this.officeRelationshipRepo.save({
      officeId: office.id,
      employeeId: employee.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { message: '등록 요청이 수락되었습니다', officeRelationship };
  }
}
