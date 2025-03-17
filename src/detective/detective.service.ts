import { Injectable } from '@nestjs/common';
import { UpdateDetectiveDto } from './dto/update-detective.dto';
import { Detective } from './entities/detective.entity';
import { Office } from '../office/entities/office.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { S3Service } from '../s3/s3.service';
import AWS from 'aws-sdk';
import { File } from '../s3/entities/s3.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class DetectiveService {
  private lambda: AWS.Lambda;
  constructor(
    @InjectRepository(Detective) private readonly detectiveRepository: Repository<Detective>,
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
    private readonly redisService: RedisService,
  ) {
    this.lambda = new AWS.Lambda();
  }

  async findUserById(id: number) {
    return await this.userService.findOneById(id);
  }

  async findUserByEmail(email: string) {
    return await this.userService.findOneByEmail(email);
  }

  async findOfficeDetectives(officeId: number) {
    return await this.detectiveRepository
      .createQueryBuilder('detective')
      .leftJoinAndSelect('detective.office', 'office')
      .where('office.id = :officeId', { officeId })
      .getMany();
  }

  async findOne(id: number) {
    return await this.detectiveRepository.findOne({
      where: { id },
      relations: [
        'user',
        'office', // 소속사
        'profile',
        'licenses',
        'careers',
        'reviews',
        'detectiveCategories',
        'detectiveEquipments',
        'detectiveRegions',
      ],
    });
  }

  async update(id: number, dto: UpdateDetectiveDto) {
    return await this.detectiveRepository.update({ id }, { ...dto });
  }

  async remove(id: number) {
    return `This action removes a #${id} detective`;
  }

  async approve(detective: Detective, office: Office) {
    detective.office = office;
    return await this.detectiveRepository.save(detective);
  }

  async saveFile(path: string): Promise<File> {
    return await this.s3Service.savePath(path);
  }

  async updateFile(id: File['id'], dto: { path: File['path'] }) {
    return await this.s3Service.updateFile(id, dto);
  }

  async findMany(page: number, limit: number) {
    const take = limit;
    const skip = (page - 1) * take;
    return await this.detectiveRepository
      .createQueryBuilder('detective')
      .leftJoinAndSelect('detective.user', 'user')
      .leftJoinAndSelect('detective.office', 'office')
      .select(['detective.categoryId', 'detective.regionId', 'user.name', 'office.name'])
      .skip(skip)
      .take(take)
      .getMany();
  }

  async findManyOrderByReviewCount(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return await this.detectiveRepository
      .createQueryBuilder('detective')
      .leftJoinAndSelect('detective.reviews', 'review')
      .loadRelationCountAndMap('detective.review_count', 'post.reviews')
      .orderBy('review_count', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();
  }

  async cacheDetectives(page: number, limit: number): Promise<Array<Partial<Detective>>> {
    const take = limit;
    const skip = (page - 1) * take;
    // 캐시에서 detective 목록 가져오기
    const cached = await this.redisService.getDetectives(take, skip);
    if (!cached) return cached;
    // 캐시가 없으면 데이터베이스에서 가져오기
    const detectives = await this.findMany(page, limit);
    // 캐시에 데이터 저장
    await this.redisService.setDetectives(take, skip, detectives);
    return detectives;
  }

  // async findManyByEquipment(name: string, page: number, limit: number) {
  //   const skip = (page - 1) * limit;
  //   return await this.dataSource
  //     .getRepository(DetectiveEquipment)
  //     .createQueryBuilder('de')
  //     .leftJoinAndSelect('de.detective', 'd')
  //     .leftJoinAndSelect('de.equipment', 'e')
  //     .where('e.name = :name', { name })
  //     .skip(skip)
  //     .take(limit)
  //     .getMany();
  // }

  // async findManyByRegion(name: string, page: number, limit: number) {
  //   const skip = (page - 1) * limit;
  //   return await this.dataSource
  //     .getRepository(DetectiveRegion)
  //     .createQueryBuilder('dr')
  //     .leftJoinAndSelect('dr.detective', 'd')
  //     .leftJoinAndSelect('dr.region', 'r')
  //     .where('r.name = :name', { name })
  //     .skip(skip)
  //     .take(limit)
  //     .getMany();
  // }

  // async findManyByCategory(name: string, page: number, limit: number) {
  //   const skip = (page - 1) * limit;
  //   return await this.dataSource
  //     .getRepository(DetectiveCategory)
  //     .createQueryBuilder('dc')
  //     .leftJoinAndSelect('dc.detective', 'd')
  //     .leftJoinAndSelect('dc.category', 'c')
  //     .where('c.name = :name', { name })
  //     .skip(skip)
  //     .take(limit)
  //     .getMany();
  // }
}
