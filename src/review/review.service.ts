import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DetectivePost } from 'src/post/entities/detective-post.entity';
import { Detective } from 'src/user/entities/detective.entity';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateReviewDTO } from './dto/create-review.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(DetectivePost)
    private readonly detectivePostRepo: Repository<DetectivePost>,
    @InjectRepository(User)
    private readonly UserRepo: Repository<User>,
    @InjectRepository(Detective)
    private readonly detectiveRepo: Repository<Detective>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    private readonly dataSource: DataSource,
  ) {}
  // 작성
  async writeReview(createReviewDTO: CreateReviewDTO) {
    const { comment, reliability, speed, accuracy, completion } = createReviewDTO;
    await this.reviewRepo.create();
  }
}
