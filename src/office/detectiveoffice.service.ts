import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Detective } from 'src/user/entities/detective.entity';
import { Repository } from 'typeorm';
import { DetectiveOffice } from './entities/detective-office.entity';
import { CreateDetectiveOfficeDto } from './dto/create-office.dto';
import { OfficeRelationship } from './entities/office-relationship.entity';
import { RelationshipDto } from './dto/create-relationship.dto';
import { UserService } from 'src/user/user.service';
import { EmailService } from 'src/mail/email.service';

@Injectable()
export class DetectiveofficeService {
  constructor(
    @InjectRepository(Detective)
    private detectiveRepo: Repository<Detective>,
    @InjectRepository(DetectiveOffice)
    private officeRepo: Repository<DetectiveOffice>,
    private emailService: EmailService,
    private userService: UserService,
    @InjectRepository(OfficeRelationship)
    private officeRelationshipRepo: Repository<OfficeRelationship>,
  ) {}

  //   async createDetectiveOffice(
  //     createDetectiveOfficeDto: CreateDetectiveOfficeDto,
  //   ): Promise<DetectiveOffice> {
  //     const { userId, name, location, description, founded, businessRegistrationNum } =
  //       createDetectiveOfficeDto;

  //     const detective = await this.detectiveRepo.findOne({ where: { userId } });

  //     if (detective.position === 'employee') {
  //       throw new Error('고용인만 오피스를 생성할 수 있습니다.');
  //     }

  //     const detectiveOffice = this.detectiveOfficeRepo.create({
  //       ownerId: detective.id,
  //       locationId: location.id
  //       name,
  //       description,
  //       founded,
  //       businessRegistrationNum,
  //     });

  //     return this.detectiveOfficeRepo.save(detectiveOffice);
  //   }

  async findOfficeByKeyword(key: string) {
    const offices = await this.officeRepo.find({ where: { name: key } });
    return offices;
  }

  // 오피스 등록 요청
  async requestRegistration(key: string, userId: number) {
    const office = this.findOfficeByKeyword(key);

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
  async approveRegistration(id: number): Promise<OfficeRelationship> {
    const officeRelationship = await this.officeRelationshipRepo.findOne({ where: { id } });

    const detective = officeRelationship.detective;
    detective.officeId = officeRelationship.officeId;
    await this.officeRepo.save(detective);

    return this.officeRelationshipRepo.save(officeRelationship);
  }
}
