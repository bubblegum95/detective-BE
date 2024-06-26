import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { DetectivePost } from './entities/detective-post.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Region } from './entities/region.entity';
import { Career } from './entities/career.entity';
import { License } from './entities/license.entity';
import { Equipment } from './entities/equipment.entity';
import { Category } from './entities/category.entity';

@Injectable()
export class PostService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(DetectivePost)
    private detectivePostRepo: Repository<DetectivePost>,
    @InjectRepository(Region)
    private regionRepo: Repository<Region>,
  ) {}

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

  // 탐정 프로필 생성
  async createProfile(createPostDto: CreatePostDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const career = await queryRunner.manager.save(Career, createPostDto.career);
      const license = await queryRunner.manager.save(License, createPostDto.license);
      const equipment = await queryRunner.manager.save(Equipment, createPostDto.equipment);
      const region = await queryRunner.manager.save(Region, createPostDto.region);
      const category = await queryRunner.manager.save(Category, createPostDto.category);

      const detectivePost = new DetectivePost();
      detectivePost.description = createPostDto.description;
      detectivePost.careerId = career.id;
      detectivePost.licenseId = license.id;
      detectivePost.regionId = region.id;
      detectivePost.categoryId = category.id;
      detectivePost.equipmentId = equipment.id;

      await queryRunner.manager.save(detectivePost);
      await queryRunner.commitTransaction();
      return detectivePost;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.log(err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
