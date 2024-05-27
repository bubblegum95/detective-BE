import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from './entities/region.entity';
import { Equipment } from './entities/equipment.entity';
import { License } from './entities/license.entity';
import { Category } from './entities/category.entity';
import { DetectivePost } from './entities/detective-post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetectivePost, Region, Equipment, License, Category])],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
