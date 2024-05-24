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
  filterPostsByRegion(id: number): Promise<DetectivePost[]> {
    const posts = this.detectivePostRepo.find({
      where: { regionId: id },
    });
    return posts;
  }

  filterPostsByCategory(id: number): Promise<DetectivePost[]> {
    const posts = this.detectivePostRepo.find({
      where: { categoryId: id },
    });
    return posts;
  }

  async findPostsByKeyword(key: string): Promise<any> {
    const detectives = await this.detectivePostRepo
      .createQueryBuilder('detectivePost')
      .leftJoinAndSelect('detectivePost.detective', 'detective')
      .leftJoinAndSelect('detective.user', 'user')
      .where('user.name ILIKE :key', { key: `%${key}%` })
      .getMany();

    const offices = await this.detectivePostRepo
      .createQueryBuilder('detectivePost')
      .leftJoinAndSelect('detectivePost.detective', 'detective')
      .leftJoinAndSelect('detective.detectiveOffice', 'detectiveOffice')
      .where('detectiveOffice.name ILIKE :key', { key: `%${key}%` })
      .getMany();

    return { detectives, offices };
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
