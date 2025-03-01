import { Injectable } from '@nestjs/common';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Region } from './entities/region.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RegionService {
  constructor(@InjectRepository(Region) private readonly regionRepository: Repository<Region>) {}

  create(dto: CreateRegionDto) {
    return this.regionRepository.save({ ...dto });
  }

  findAll() {
    return this.regionRepository.find();
  }

  findOne(id: number) {
    return this.regionRepository.findOne({ where: { id } });
  }

  update(id: number, dto: UpdateRegionDto) {
    return this.regionRepository.update({ id }, { ...dto });
  }

  remove(id: number) {
    return this.regionRepository.delete({ id });
  }
}
