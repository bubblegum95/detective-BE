import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { DetectivePost } from './entities/detective-post.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Region } from './entities/region.entity';
import { RegionEnum } from './type/region.type';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(DetectivePost)
    private detectivePostRepo: Repository<DetectivePost>,
    @InjectRepository(Region)
    private regionRepo: Repository<Region>,
  ) {}
  create(createPostDto: CreatePostDto) {
    return 'This action adds a new post';
  }

  // 지역별 조회
  async findRegion(regionName: RegionEnum): Promise<DetectivePost[]> {
    const posts = await this.detectivePostRepo.find({
      where: { region: { name: regionName } },
      relations: ['region'],
    });
    return posts;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
