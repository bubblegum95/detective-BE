import { Injectable } from '@nestjs/common';
import { Detective } from './entities/detective.entity';
import { Office } from '../office/entities/office.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { S3Service } from '../s3/s3.service';
import AWS from 'aws-sdk';
import { File } from '../s3/entities/s3.entity';
import { RedisService } from '../redis/redis.service';
import { DetectiveEquipment } from './entities/detectiveEquipment.entity';
import { DetectiveRegion } from './entities/detectiveRegion.entity';
import { DetectiveCategory } from './entities/detectiveCategory.entity';
import { Category } from '../category/entities/category.entity';
import { User } from '../user/entities/user.entity';
import { CategoryService } from '../category/category.service';
import { EquipmentService } from '../equipment/equipment.service';
import { RegionService } from '../region/region.service';
import { Equipment } from '../equipment/entities/equipment.entity';
import { Region } from '../region/entities/region.entity';
import { UpdateDetectiveDao } from './dao/update-detective.dao';

@Injectable()
export class DetectiveService {
  private lambda: AWS.Lambda;
  constructor(
    @InjectRepository(Detective) private readonly detectiveRepository: Repository<Detective>,
    @InjectRepository(DetectiveCategory)
    private readonly dCategoryRepository: Repository<DetectiveCategory>,
    @InjectRepository(DetectiveEquipment)
    private readonly dEquipmentRepository: Repository<DetectiveEquipment>,
    @InjectRepository(DetectiveRegion)
    private readonly dRegionRepository: Repository<DetectiveRegion>,
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
    private readonly redisService: RedisService,
    private readonly categoryService: CategoryService,
    private readonly equipmentService: EquipmentService,
    private readonly regionService: RegionService,
  ) {
    this.lambda = new AWS.Lambda();
  }

  async findUserById(id: User['id']) {
    return await this.userService.findOneById(id);
  }

  async findUserByEmail(email: User['email']) {
    return await this.userService.findOneByEmail(email);
  }

  async findOfficeDetectives(officeId: Office['id']) {
    return await this.detectiveRepository
      .createQueryBuilder('detective')
      .leftJoinAndSelect('detective.office', 'office')
      .where('office.id = :officeId', { officeId })
      .getMany();
  }

  async findOne(id: Detective['id']) {
    return await this.detectiveRepository
      .createQueryBuilder('detective')
      .leftJoinAndSelect('detective.user', 'user')
      .leftJoinAndSelect('detective.office', 'office')
      .leftJoinAndSelect('detective.profile', 'profile')
      .leftJoinAndSelect('detective.licenses', 'licenses')
      .leftJoinAndSelect('detective.careers', 'careers')
      .leftJoinAndSelect('detective.detectiveCategories', 'detectiveCategories')
      .leftJoinAndSelect('detectiveCategories.category', 'category')
      .leftJoinAndSelect('detective.detectiveEquipments', 'detectiveEquipments')
      .leftJoinAndSelect('detectiveEquipments.equipment', 'equipment')
      .leftJoinAndSelect('detective.detectiveRegions', 'detectiveRegions')
      .leftJoinAndSelect('detectiveRegions.region', 'region')
      .where('detective.id = :id', { id })
      .getOne();
  }

  async findOneByUser(userId: User['id']) {
    return await this.detectiveRepository
      .createQueryBuilder('detective')
      .leftJoin('detective.user', 'user')
      .leftJoinAndSelect('detective.office', 'office')
      .leftJoinAndSelect('detective.profile', 'profile')
      .leftJoinAndSelect('detective.licenses', 'licenses')
      .leftJoinAndSelect('detective.careers', 'careers')
      .leftJoinAndSelect('detective.detectiveCategories', 'detectiveCategories')
      .leftJoinAndSelect('detectiveCategories.category', 'category')
      .leftJoinAndSelect('detective.detectiveEquipments', 'detectiveEquipments')
      .leftJoinAndSelect('detectiveEquipments.equipment', 'equipment')
      .leftJoinAndSelect('detective.detectiveRegions', 'detectiveRegions')
      .leftJoinAndSelect('detectiveRegions.region', 'region')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  async findOneWithUser(id: Detective['id']) {
    return await this.detectiveRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async update(id: Detective['id'], dto: UpdateDetectiveDao) {
    return await this.detectiveRepository.update({ id }, { ...dto });
  }

  async approve(detective: Detective, office: Office) {
    detective.office = office;
    return await this.detectiveRepository.save(detective);
  }

  async findUserDFile(userId: User['id']) {
    return await this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.detective', 'd')
      .leftJoinAndSelect('d.profile', 'profile')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  async findFile(id: File['id']) {
    return await this.s3Service.findOneWithDetectiveUser(id);
  }

  async saveFile(path: File['path']): Promise<File> {
    return await this.s3Service.savePath(path);
  }

  async updateFile(id: File['id'], dto: { path: File['path'] }) {
    return await this.s3Service.updateFile(id, dto);
  }

  async findMany(page: number, limit: number) {
    const take = limit;
    const offset = (page - 1) * take;
    return await this.detectiveRepository
      .createQueryBuilder('detective')
      .leftJoinAndSelect('detective.user', 'user')
      .leftJoinAndSelect('detective.office', 'office')
      .select(['user.name', 'office.name'])
      .offset(offset)
      .limit(take)
      .getMany();
  }

  // 리뷰순 정렬
  async findManyOrderByReviewCount(page: number, limit: number) {
    const offset = (page - 1) * limit;
    return await this.detectiveRepository
      .createQueryBuilder('detective')
      .leftJoinAndSelect('detective.user', 'user')
      .leftJoinAndSelect('detective.office', 'office')
      .leftJoinAndSelect('detective.profile', 'profile')
      .leftJoin('detective.reviews', 'review')
      .select([
        'detective.id',
        'detective.subject',
        'user.name',
        'profile.path',
        'office.name',
        'office.address',
      ])
      .loadRelationCountAndMap('detective.review_count', 'detective.reviews')
      .orderBy('review_count', 'DESC')
      .offset(offset)
      .limit(limit)
      .getManyAndCount();
  }

  async findManyByRegion(regionId: Region['id'], page: number, limit: number) {
    const offset = (page - 1) * limit;
    return await this.dataSource
      .getRepository(DetectiveRegion)
      .createQueryBuilder('dr')
      .leftJoinAndSelect('dr.detective', 'd')
      .leftJoinAndSelect('dr.region', 'r')
      .leftJoinAndSelect('d.user', 'user')
      .leftJoinAndSelect('d.office', 'office')
      .leftJoinAndSelect('d.profile', 'profile')
      .where('r.id = :regionId', { regionId })
      .select([
        'dr.id',
        'd.id',
        'd.subject',
        'user.name',
        'profile.path',
        'office.name',
        'office.address',
      ])
      .offset(offset)
      .limit(limit)
      .getManyAndCount();
  }

  async findManyByCategory(categoryId: Category['id'], page: number, limit: number) {
    const skip = (page - 1) * limit;
    return await this.dataSource
      .getRepository(DetectiveCategory)
      .createQueryBuilder('dc')
      .leftJoinAndSelect('dc.detective', 'd')
      .leftJoinAndSelect('dc.category', 'c')
      .leftJoinAndSelect('d.user', 'user')
      .leftJoinAndSelect('d.office', 'office')
      .leftJoinAndSelect('d.profile', 'profile')
      .where('c.id = :categoryId', { categoryId })
      .select([
        'dc.id',
        'd.id',
        'd.subject',
        'user.name',
        'profile.path',
        'office.name',
        'office.address',
      ])
      .offset(skip)
      .limit(limit)
      .getManyAndCount();
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

  async findCategory(id: Category['id']) {
    return await this.categoryService.findOne(id);
  }

  async findUserDC(userId: User['id']) {
    return await this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.detective', 'd')
      .leftJoinAndSelect('d.detectiveCategories', 'dc')
      .leftJoinAndSelect('dc.category', 'c')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  async createDC(detective: Detective, category: Category) {
    return await this.dCategoryRepository.save({ detective, category });
  }

  async removeDC(id: DetectiveCategory['id']) {
    return await this.dCategoryRepository.delete({ id });
  }

  async findUserDE(userId: User['id']) {
    return await this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.detective', 'd')
      .leftJoinAndSelect('d.detectiveEquipments', 'de')
      .leftJoinAndSelect('de.equipment', 'e')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  async findEquipment(id: Equipment['id']) {
    return await this.equipmentService.findOne(id);
  }

  async createDE(detective: Detective, equipment: Equipment) {
    return await this.dEquipmentRepository.save({ detective, equipment });
  }

  async removeDE(id: DetectiveEquipment['id']) {
    return this.dEquipmentRepository.delete({ id });
  }

  async findUserDR(userId: User['id']) {
    return await this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.detective', 'd')
      .leftJoinAndSelect('d.detectiveRegions', 'dr')
      .leftJoinAndSelect('dr.region', 'r')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  async findRegion(id: Region['id']) {
    return await this.regionService.findOne(id);
  }

  async createDR(detective: Detective, region: Region) {
    return await this.dRegionRepository.save({ detective, region });
  }

  async removeDR(id: DetectiveRegion['id']) {
    return await this.dRegionRepository.delete({ id });
  }
}
