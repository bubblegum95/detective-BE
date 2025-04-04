import { Injectable } from '@nestjs/common';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { License } from './entities/license.entity';
import { Repository } from 'typeorm';
import { CreateLicenseDto } from './dto/create-license.dto';
import { User } from '../user/entities/user.entity';
import { Detective } from '../detective/entities/detective.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class LicenseService {
  constructor(
    @InjectRepository(License) private readonly licenseRepository: Repository<License>,
    private readonly userService: UserService,
  ) {}

  async findUser(userId: User['id']) {
    return await this.userService.findOneWithDetective(userId);
  }

  async create(dto: CreateLicenseDto, detective: Detective) {
    return await this.licenseRepository.save({ ...dto, detective });
  }

  async findAll(userId: User['id']) {
    return await this.licenseRepository
      .createQueryBuilder('license')
      .leftJoin('license.detective', 'd')
      .leftJoin('d.user', 'u')
      .where('u.id = :userId', { userId })
      .getMany();
  }

  async findOne(id: License['id']) {
    return await this.licenseRepository.findOne({ where: { id } });
  }

  async findOneWithDetective(id: License['id']) {
    return await this.licenseRepository.findOne({ where: { id }, relations: ['detective'] });
  }

  async update(id: License['id'], dto: UpdateLicenseDto) {
    return await this.licenseRepository.update({ id }, { ...dto });
  }

  async remove(id: License['id']) {
    return await this.licenseRepository.delete({ id });
  }
}
