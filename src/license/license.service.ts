import { Injectable } from '@nestjs/common';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { License } from './entities/license.entity';
import { Repository } from 'typeorm';
import { CreateLicenseDto } from './dto/create-license.dto';

@Injectable()
export class LicenseService {
  constructor(@InjectRepository(License) private readonly licenseRepository: Repository<License>) {}

  async create(dto: CreateLicenseDto) {
    return await this.licenseRepository.save(dto);
  }

  findAll() {
    return `This action returns all license`;
  }

  async findOne(id: number) {
    return await this.licenseRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateLicenseDto) {
    return await this.licenseRepository.update({ id }, { ...dto });
  }

  async remove(id: number) {
    return await this.licenseRepository.delete({ id });
  }
}
