import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { RoleType } from './types/role.type';

@Injectable()
export class RoleService {
  constructor(@InjectRepository(Role) private readonly roleRepository: Repository<Role>) {}

  async find(name: RoleType) {
    return await this.roleRepository.findOne({ where: { name } });
  }

  async findById(id: number) {
    return await this.roleRepository.findOne({ where: { id } });
  }

  async create(name: Role['name']) {
    return await this.roleRepository.save({ name });
  }
}
