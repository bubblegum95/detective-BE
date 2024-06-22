import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetectivePost } from 'src/post/entities/detective-post.entity';
import { User } from 'src/user/entities/user.entity';
import { Detective } from 'src/user/entities/detective.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetectivePost, User, Detective])],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
