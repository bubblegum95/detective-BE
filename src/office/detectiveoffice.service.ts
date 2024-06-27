import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DetectiveOffice } from './entities/detective-office.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DetectiveofficeService {
  constructor(
    @InjectRepository(DetectiveOffice)
    private officeRepo: Repository<DetectiveOffice>,
  ) {}
  async findOfficeByKeyword(key: string) {
    const offices = await this.officeRepo.find({ where: { name: key } });
    return offices;
  }
}
