import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Office } from './entities/office.entity';
import { CreateOfficeDto } from './dto/create-office.dto';
import { User } from '../user/entities/user.entity';
import { DetectiveService } from '../detective/detective.service';
import { Detective } from '../detective/entities/detective.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class OfficeService {
  constructor(
    @InjectRepository(Office)
    private readonly officeRepo: Repository<Office>,
    private readonly detectiveService: DetectiveService,
    private readonly userService: UserService,
  ) {}

  async findUserByEmail(email: User['email']) {
    return await this.userService.findOneByEmail(email);
  }

  async create(owner: User, dto: CreateOfficeDto) {
    return await this.officeRepo.save({ ...dto, owner });
  }

  async findByName(name: string, take: number, skip: number) {
    return await this.officeRepo
      .createQueryBuilder('office')
      .where('office.name LIKE :name', { name: `%${name}%` })
      .getMany();
  }

  async findByNameWithDetective(name: string, take: number, skip: number) {
    return await this.officeRepo
      .createQueryBuilder('office')
      .leftJoinAndSelect('office.employees', 'e')
      .leftJoinAndSelect('e.detective', 'd')
      .where('office.name LIKE :name', { name: `%${name}%` })
      .skip(skip)
      .take(take)
      .getMany();
  }

  async findOneById(id: Office['id']) {
    return await this.officeRepo.findOne({
      where: { id },
      relations: ['owner', 'employees'],
    });
  }

  async approve(detective: Detective, office: Office) {
    await this.detectiveService.approve(detective, office);
  }
}
