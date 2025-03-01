import { Injectable } from '@nestjs/common';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Consultation } from './entities/consultation.entity';
import { Repository } from 'typeorm';
import { ConsultationStatus } from './types/status.type';
import { User } from '../user/entities/user.entity';
import { Detective } from '../detective/entities/detective.entity';
import { UserService } from '../user/user.service';
import { DetectiveService } from '../detective/detective.service';

@Injectable()
export class ConsultationService {
  constructor(
    @InjectRepository(Consultation)
    private readonly consultationRepository: Repository<Consultation>,
    private readonly userService: UserService,
    private readonly detectiveService: DetectiveService,
  ) {}

  async findUser(id: User['id']) {
    return await this.userService.findOneById(id);
  }

  async findDetective(id: Detective['id']) {
    return await this.detectiveService.findOne(id);
  }

  async create(dto: CreateConsultationDto, consumer: User, detective: Detective) {
    return await this.consultationRepository.save({ ...dto, consumer, detective });
  }

  async findAllForConsumers(userId: User['id'], skip: number, take: number) {
    return await this.consultationRepository
      .createQueryBuilder('consultation')
      .leftJoin('consultation.user', 'u')
      .where('u.id = :userId', { userId })
      .skip(skip)
      .take(take)
      .getMany();
  }

  async findAllForDetectives(
    userId: number,
    skip: number,
    take: number,
    status?: ConsultationStatus,
  ) {
    const query = this.consultationRepository
      .createQueryBuilder('consultation')
      .leftJoin('consultation.detective', 'd')
      .leftJoin('d.user', 'u')
      .leftJoinAndSelect('consultation.consumer', 'c')
      .addSelect(['c.email', 'c.nickname'])
      .where('u.id = :userId', { userId })
      .skip(skip)
      .take(take);

    if (status) {
      query.andWhere('consultation.status = :status', { status });
    }

    return await query.getMany();
  }

  async findOne(id: Consultation['id']) {
    return await this.consultationRepository
      .createQueryBuilder('consultation')
      .leftJoinAndSelect('consultation.consumer', 'consumer')
      .leftJoin('consultation.detective', 'd')
      .leftJoinAndSelect('d.user', 'user')
      .addSelect([
        'consumer.email',
        'consumer.nickname',
        'user.email',
        'user.nickname',
        'user.name',
      ])
      .where('consultation.id = :id', { id })
      .getOne();
  }

  async findOneWithRelations(id: Consultation['id']) {
    return await this.consultationRepository.findOne({
      where: { id },
      relations: ['consumer', 'detective', 'detective.user'],
    });
  }

  async updateContent(id: number, dto: UpdateConsultationDto) {
    return await this.consultationRepository.update({ id }, { ...dto });
  }

  async updateStatus(id: number, status: ConsultationStatus) {
    return await this.consultationRepository.update({ id }, { status });
  }

  async remove(id: number) {
    return await this.consultationRepository.delete({ id });
  }
}
