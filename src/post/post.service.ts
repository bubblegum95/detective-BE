import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { DetectivePost } from './entities/detective-post.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Region } from './entities/region.entity';
import { Career } from './entities/career.entity';
import { License } from './entities/license.entity';
import { Equipment } from './entities/equipment.entity';
import { Category } from './entities/category.entity';
import { EquipmentEnum } from './type/equipment.type';
import { CategoryEnum } from './type/category.type';
import { UserService } from '../user/user.service';
import { S3Service } from '../s3/s3.service';
import { RegionEnum } from './type/region.type';
import { DetectiveOffice } from 'src/office/entities/detective-office.entity';
import * as AWS from 'aws-sdk';
import { create } from 'domain';

@Injectable()
export class PostService {
  private lambda: AWS.Lambda;
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(DetectivePost)
    private detectivePostRepo: Repository<DetectivePost>,

    @InjectRepository(Region)
    private regionRepo: Repository<Region>,
    private userService: UserService,
    private readonly s3Service: S3Service,
  ) {
    this.lambda = new AWS.Lambda();
  }

  //! 출력값 타입 손 봐야함

  // 지역별 조회
  async filterPostsByRegion(id: number, page: number): Promise<DetectivePost[]> {
    const pageSize = 20;
    const skip = (page - 1) * pageSize;

    const [posts, count] = await this.detectivePostRepo
      .createQueryBuilder('detectivePost')
      .leftJoinAndSelect('detectivePost.detective', 'detective')
      .leftJoinAndSelect('detective.user', 'user')
      .select([
        'detectivePost.id',
        'detectivePost.categoryId',
        'detectivePost.regionId',
        'user.name',
      ])
      .where('detectivePost.regionId = :id', { id })
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return posts;
  }

  async filterPostsByCategory(id: number, page: number): Promise<DetectivePost[]> {
    const pageSize = 20;
    const skip = (page - 1) * pageSize;
    const posts = await this.detectivePostRepo
      .createQueryBuilder('detectivePost')
      .leftJoinAndSelect('detectivePost.detective', 'detective')
      .leftJoinAndSelect('detective.user', 'user')
      .leftJoinAndSelect('detective.detectiveOffice', 'office')
      .select(['detectivePost.categoryId', 'detectivePost.regionId', 'user.name', 'office.name'])
      .where('detectivePost.categoryId = :id', { id })
      .skip(skip)
      .take(pageSize)
      .getRawMany();

    return posts;
  }

  async findPostsByKeyword(key: string): Promise<any> {
    // const detectives = await this.detectivePostRepo
    //   .createQueryBuilder('detectivePost')
    //   .leftJoinAndSelect('detectivePost.detective', 'detective')
    //   .leftJoinAndSelect('detective.user', 'user')
    //   .select(['detectivePost.categoryId', 'detectivePost.regionId', 'user.name'])
    //   .where('user.name ILIKE :key', { key: `%${key}%` })
    //   .getRawMany();

    const offices = await this.detectivePostRepo
      .createQueryBuilder('detectivePost')
      .leftJoinAndSelect('detectivePost.detective', 'detective')
      .leftJoinAndSelect('detective.detectiveOffice', 'office')
      .select(['office.name', 'detectivePost.categoryId', 'detectivePost.regionId', 'office.id'])
      .where('office.name ILIKE :key', { key: `%${key}%` })
      .getRawMany();
    console.log(offices);
    return { offices };
  }

  async uploadFile(file: Express.Multer.File): Promise<number> {
    const params = {
      FunctionName: 'file-compression',
      Payload: JSON.stringify({
        fileContent: file.buffer.toString('base64'),
        fileName: file.originalname,
      }),
    };

    try {
      const result = await this.lambda.invoke(params).promise();
      console.log('람다 함수 호출 후 result:', result);
      const payload = JSON.parse(result.Payload as string);
      if (result.StatusCode === 200) {
        console.log('파일 업로드 성공, 파일 Id:', payload.fileId);
        return payload.fileId;
      } else {
        console.error('람다 함수 호출 실패:', payload.error);
        throw new Error(payload.error);
      }
    } catch (err) {
      console.error('파일 업로드 실패:', err);
      throw err;
    }
  }

  // 탐정 프로필 생성
  async createProfile(createPostDto: CreatePostDto, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userService.findOneById(userId);
      const detectiveId = user.detective ? user.detective.id : null;

      if (!detectiveId) {
        throw new Error('탐정 로그인이 필요합니다.');
      }

      createPostDto.detectiveId = detectiveId;

      const career = new Career();
      Object.assign(career, createPostDto.career);
      career.detectiveId = detectiveId;
      const saveCareer = await queryRunner.manager.save(career);

      const license = new License();
      Object.assign(license, createPostDto.license);
      const saveLicense = await queryRunner.manager.save(license);

      const equipmentName = createPostDto.equipment.name;

      const equipment = await queryRunner.manager.findOne(Equipment, {
        where: { name: equipmentName as EquipmentEnum },
      });

      if (!equipment) {
        throw new Error(`유효하지 않은 장비 이름입니다: ${equipmentName}`);
      }
      const regionName = createPostDto.region.name;

      const region = await queryRunner.manager.findOne(Region, {
        where: { name: regionName as RegionEnum },
      });

      if (!region) {
        throw new Error(`유효하지 않은 지역 이름입니다: ${regionName}`);
      }

      const categoryName = createPostDto.category.name;

      const category = await queryRunner.manager.findOne(Category, {
        where: { name: categoryName as CategoryEnum },
      });

      if (!category) {
        throw new Error(`유효하지 않은 카테고리 이름입니다: ${categoryName}`);
      }

      const detectivePost = new DetectivePost();
      detectivePost.description = createPostDto.description;
      detectivePost.careerId = saveCareer.id;
      detectivePost.licenseId = saveLicense.id;
      detectivePost.regionId = region.id;
      detectivePost.categoryId = category.id;
      detectivePost.equipmentId = equipment.id;
      detectivePost.detectiveId = detectiveId;
      detectivePost.profileFileId = createPostDto.file;

      console.log('detectivePost:', detectivePost);

      const saveDetectivePost = await queryRunner.manager.save(detectivePost);
      await queryRunner.commitTransaction();

      return { detectivePost: saveDetectivePost };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new Error(`프로필 생성에 실패하였습니다: ${err.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}
