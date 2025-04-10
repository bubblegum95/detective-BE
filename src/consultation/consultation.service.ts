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
import { Category } from '../category/entities/category.entity';
import { CategoryService } from '../category/category.service';

@Injectable()
export class ConsultationService {
  constructor(
    @InjectRepository(Consultation)
    private readonly consultationRepository: Repository<Consultation>,
    private readonly userService: UserService,
    private readonly detectiveService: DetectiveService,
    private readonly categoryService: CategoryService,
  ) {}

  async findUser(id: User['id']) {
    return await this.userService.findOneById(id);
  }

  async findDetective(id: Detective['id']) {
    return await this.detectiveService.findOne(id);
  }

  async findDetectiveWithUser(id: Detective['id']) {
    return await this.detectiveService.findOneWithUser(id);
  }

  async findCategory(id: Category['id']) {
    return await this.categoryService.findOne(id);
  }

  async create(
    dto: CreateConsultationDto,
    consumer: User,
    detective: Detective,
    category: Category,
  ) {
    return await this.consultationRepository.save({ ...dto, consumer, detective, category });
  }

  async findAllForConsumers(userId: User['id'], offset: number, limit: number) {
    return await this.consultationRepository
      .createQueryBuilder('consultation')
      .leftJoin('consultation.category', 'category')
      .leftJoin('consultation.consumer', 'c')
      .leftJoin('consultation.detective', 'd')
      .leftJoin('d.user', 'u')
      .where('c.id = :userId', { userId })
      .select([
        'consultation.id',
        'consultation.subject',
        'consultation.state',
        'consultation.createdAt',
      ])
      .addSelect(['category.id', 'category.name', 'd.id', 'u.name', 'u.email', 'c.nickname'])
      .offset(offset)
      .limit(limit)
      .getManyAndCount();
  }

  async findAllForDetectives(
    userId: number,
    offset: number,
    limit: number,
    status?: ConsultationStatus,
  ) {
    const query = this.consultationRepository
      .createQueryBuilder('consultation')
      .leftJoin('consultation.category', 'category')
      .leftJoin('consultation.detective', 'd')
      .leftJoin('d.user', 'u')
      .leftJoin('consultation.consumer', 'c')
      .where('u.id = :userId', { userId })
      .select(['consultation.id', 'consultation.subject'])
      .addSelect(['category.id', 'category.name', 'd.id', 'u.name', 'c.email', 'c.nickname'])
      .offset(offset)
      .limit(limit);

    if (status) {
      query.andWhere('consultation.status = :status', { status });
    }

    return await query.getManyAndCount();
  }

  async findOne(id: Consultation['id']) {
    return await this.consultationRepository
      .createQueryBuilder('consultation')
      .leftJoinAndSelect('consultation.category', 'category')
      .leftJoin('consultation.consumer', 'consumer')
      .leftJoin('consultation.detective', 'detective')
      .leftJoin('detective.user', 'user')
      .addSelect([
        'consumer.email',
        'consumer.nickname',
        'detective.id',
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
