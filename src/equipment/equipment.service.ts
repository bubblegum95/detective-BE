import { Injectable } from '@nestjs/common';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Equipment } from './entities/equipment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment) private readonly equipmentRepository: Repository<Equipment>,
  ) {}

  async create(dto: CreateEquipmentDto) {
    return await this.equipmentRepository.save({ ...dto });
  }

  async findAll() {
    return await this.equipmentRepository.find();
  }

  async findOne(id: number) {
    return await this.equipmentRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateEquipmentDto) {
    return await this.equipmentRepository.update({ id }, { ...dto });
  }

  async remove(id: number) {
    return await this.equipmentRepository.delete({ id });
  }
}
