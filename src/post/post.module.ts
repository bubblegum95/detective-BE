import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetectivePost } from './entities/detective-post.entity';
import { Region } from './entities/region.entity';
import { Equipment } from './entities/equipment.entity';
import { License } from './entities/license.entity';
import { Category } from './entities/category.entity';
import { Career } from './entities/career.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetectivePost, Region, Equipment, License, Category, Career]),
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
