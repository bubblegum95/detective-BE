import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetectivePost } from './entities/detective-post.entity';
import { Region } from './entities/region.entity';
import { Equipment } from './entities/equipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetectivePost, Region, Equipment])],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
