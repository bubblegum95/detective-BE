import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareerDto } from './dto/create-career.dto';
import { Career } from './entities/career.entity';
import { Detective } from '../detective/entities/detective.entity';

@Injectable()
export class CareerService {
  constructor(@InjectRepository(Career) private readonly careerRepository: Repository<Career>) {}

  async create(detective: Detective, careerDto: CareerDto) {
    return await this.careerRepository.save({ ...careerDto, detective });
  }

  async findOne(id: number) {
    return await this.careerRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    data: {
      startDate?: string;
      endDate?: string;
      businessDetails?: string;
      corporateName?: string;
      position?: string;
    },
  ) {
    return await this.careerRepository.update({ id }, { ...data });
  }

  async remove(id: number) {
    return await this.careerRepository.delete({ id });
  }
}
