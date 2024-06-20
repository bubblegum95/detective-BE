import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from './entities/region.entity';
import { Equipment } from './entities/equipment.entity';
import { License } from './entities/license.entity';
import { Category } from './entities/category.entity';
import { Career } from './entities/career.entity';
import { Detective } from 'src/user/entities/detective.entity';
import { User } from 'src/user/entities/user.entity';
import { DetectivePost } from './entities/detective-post.entity';
import { S3Module } from 'src/s3/s3.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    S3Module,
    AuthModule,
    TypeOrmModule.forFeature([
      DetectivePost,
      Region,
      Equipment,
      License,
      Category,
      Career,
      Detective,
      User,
      Detective,
      JwtModule,
    ]),
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
