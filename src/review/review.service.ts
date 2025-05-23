import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { SaveReviewDto } from './dto/save-review.dto';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { DetectiveService } from '../detective/detective.service';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Detective } from '../detective/entities/detective.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    private readonly userService: UserService,
    private readonly detectiveService: DetectiveService,
  ) {}

  async findUserById(userId: number) {
    return await this.userService.findOneById(userId);
  }

  async findDetectiveById(detectiveId: number) {
    return await this.detectiveService.findOne(detectiveId);
  }

  async create(dto: SaveReviewDto) {
    return await this.reviewRepo.save({ ...dto });
  }

  async update(id: number, dto: UpdateReviewDto) {
    try {
      return this.reviewRepo.update({ id }, { ...dto });
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    return await this.reviewRepo.findOne({ where: { id }, relations: ['consumer'] });
  }

  async findAll(detectiveId: Detective['id'], skip: number, take: number) {
    return await this.reviewRepo
      .createQueryBuilder('review')
      .leftJoin('review.detective', 'd')
      .leftJoin('review.consumer', 'c')
      .where('d.id = :detectiveId', { detectiveId })
      .addSelect(['c.nickname'])
      .skip(skip)
      .take(take)
      .getManyAndCount();
  }
}
