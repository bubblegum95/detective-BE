import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { SaveReviewDto } from './dto/save-review.dto';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { DetectiveService } from '../detective/detective.service';

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

  async findOne(id: number) {
    return await this.reviewRepo.findOne({ where: { id }, relations: ['consumer'] });
  }

  async findAll(detectiveId: number, skip: number, take: number) {
    return await this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.detective', 'd')
      .where('d.id = :detectiveId', { detectiveId })
      .skip(skip)
      .take(take)
      .getMany();
  }

  async createReview(user: User, detectiveId: number, dto: CreateReviewDto) {
    try {
      const foundUser = await this.findUserById(user.id);
      if (!foundUser) {
        throw new BadRequestException('존재하지 않는 계정입니다.');
      }
      const detective = await this.findDetectiveById(detectiveId);
      if (!detective) {
        throw new BadRequestException('존재하지 않는 탐정 프로필입니다.');
      }
      return await this.create({ ...dto, consumer: foundUser, detective });
    } catch (error) {
      throw error;
    }
  }
}
