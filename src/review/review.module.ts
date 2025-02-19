import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Review } from './entities/review.entity';
import { JwtStrategy } from 'src/utils/strategies/jwt.strategy';
import { UserModule } from 'src/user/user.module';
import { Detective } from '../detective/entities/detective.entity';
import { DetectiveModule } from '../detective/detective.module';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService, JwtStrategy],
  imports: [TypeOrmModule.forFeature([User, Detective, Review]), UserModule, DetectiveModule],
})
export class ReviewModule {}
