import { Injectable } from '@nestjs/common';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Region } from './entities/region.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RegionService {
  constructor(@InjectRepository(Region) private readonly regionRepository: Repository<Region>) {}

  async create(dto: CreateRegionDto) {
    return await this.regionRepository.save({ ...dto });
  }

  async findAll() {
    return await this.regionRepository.find();
  }

  async findOne(id: number) {
    return await this.regionRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateRegionDto) {
    return await this.regionRepository.update({ id }, { ...dto });
  }

  async remove(id: number) {
    return await this.regionRepository.delete({ id });
  }
}
