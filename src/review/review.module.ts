import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetectivePost } from 'src/post/entities/detective-post.entity';
import { User } from 'src/user/entities/user.entity';
import { Detective } from 'src/user/entities/detective.entity';
import { Review } from './entities/review.entity';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([DetectivePost, User, Detective, Review]), UserModule],
  controllers: [ReviewController],
  providers: [ReviewService, JwtStrategy],
})
export class ReviewModule {}
