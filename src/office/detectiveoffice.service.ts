import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Detective } from 'src/user/entities/detective.entity';
import { Repository } from 'typeorm';
import { DetectiveOffice } from './entities/detective-office.entity';
import { CreateDetectiveOfficeDto } from './dto/create-office.dto';

@Injectable()
export class DetectiveofficeService {
  constructor(
    @InjectRepository(Detective)
    private detectiveRepo: Repository<Detective>,
    @InjectRepository(DetectiveOffice)
    private detectiveOfficeRepo: Repository<DetectiveOffice>,
  ) {}

  async createDetectiveOffice(
    createDetectiveOfficeDto: CreateDetectiveOfficeDto,
  ): Promise<DetectiveOffice> {
    const { userId, name, location, description, founded, businessRegistrationNum } =
      createDetectiveOfficeDto;

    const detective = await this.detectiveRepo.findOne({ where: { userId } });

    if (detective.position === 'employee') {
      throw new Error('고용인만 오피스를 생성할 수 있습니다.');
    }

    const detectiveOffice = this.detectiveOfficeRepo.create({
      ownerId: detective.id,
      locationId: location.id
      name,
      description,
      founded,
      businessRegistrationNum,
    });

    return this.detectiveOfficeRepo.save(detectiveOffice);
  }

  // 오피스 등록 요청
  async requestRegistration() {}
}
