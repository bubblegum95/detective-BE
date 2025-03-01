import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCareerDto } from './dto/create-career.dto';
import { Career } from './entities/career.entity';
import { User } from '../user/entities/user.entity';
import { UpdateCareerDto } from './dto/update-career.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class CareerService {
  constructor(
    @InjectRepository(Career) private readonly careerRepository: Repository<Career>,
    private readonly userService: UserService,
  ) {}

  async findUser(id: User['id']) {
    return this.userService.findOneById(id);
  }

  async create(user: User, dto: CreateCareerDto) {
    const detective = user.detective;
    return await this.careerRepository.save({ ...dto, detective });
  }

  async findOne(id: number) {
    return await this.careerRepository.findOne({
      where: { id },
      relations: ['detective', 'detective.user'],
    });
  }

  async findMany(userId: User['id']) {
    return await this.careerRepository
      .createQueryBuilder('career')
      .leftJoinAndSelect('career.detective', 'd')
      .leftJoinAndSelect('d.user', 'u')
      .where('u.id = :userId', { userId })
      .getMany();
  }

  async update(id: number, data: UpdateCareerDto) {
    return await this.careerRepository.update({ id }, { ...data });
  }

  async remove(id: number) {
    return await this.careerRepository.delete({ id });
  }
}
