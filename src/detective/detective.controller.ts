import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  Res,
  HttpStatus,
  BadRequestException,
  ConflictException,
  UploadedFile,
  UseInterceptors,
  Delete,
} from '@nestjs/common';
import { DetectiveService } from './detective.service';
import { UpdateDetectiveDto } from './dto/update-detective.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../utils/guards/jwt-auth.guard';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../utils/multerStorage';
import { FindQueryDto } from './dto/find-query.dto';
import { findQueryKeyType } from './type/find-query-key.type';
import { Category } from '../category/entities/category.entity';
import { Equipment } from '../equipment/entities/equipment.entity';
import { Region } from '../region/entities/region.entity';
import { UserInfo } from '../utils/decorators/decorator';
import { DetectiveCategory } from './entities/detectiveCategory.entity';
import { Detective } from './entities/detective.entity';
import { CreateDetectiveProfileImageDto } from './dto/create-detective-profile-image.dto';

@ApiTags('Detectives')
@Controller('detectives')
export class DetectiveController {
  constructor(private readonly detectiveService: DetectiveService) {}

  @Get() // 탐정 목록 조회
  @ApiOperation({ summary: '탐정 키워드 목록 조회', description: '탐정 키워드 목록 조회' })
  async findMany(@Query() query: FindQueryDto, @Res() res: Response) {
    try {
      let detectives: Array<Detective>;
      let total: number;
      switch (query.key) {
        case findQueryKeyType.CATEGORY:
          const [dcs, dcTotal] = await this.detectiveService.findManyByCategory(
            query.value,
            query.page,
            query.limit,
          );
          detectives = dcs.map(({ detective }) => detective);
          total = dcTotal;
          break;
        case findQueryKeyType.REGION:
          const [drs, drTotal] = await this.detectiveService.findManyByRegion(
            query.value,
            query.page,
            query.limit,
          );
          detectives = drs.map(({ detective }) => detective);
          total = drTotal;
          break;
        default:
          [detectives, total] = await this.detectiveService.findManyOrderByReviewCount(
            query.page,
            query.limit,
          );
          break;
      }
      return res.status(HttpStatus.OK).json({
        success: true,
        message: '탐정 키워드 목록 조회',
        data: detectives,
        total: total,
      });
    } catch (error) {
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        message: '탐정조회를 완료할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @Get('detail/:id')
  @ApiOperation({ summary: '탐정 프로필 단일 조회', description: '탐정 프로필 단일 조회' })
  async findOne(@Param('id') id: number, @Res() res: Response) {
    try {
      const detective = await this.detectiveService.findOne(id);
      if (!detective) {
        throw new BadRequestException('해당 탐정 프로필이 존재하지 않습니다.');
      }
      const categories = detective.detectiveCategories.map(({ category }) => category);
      const regions = detective.detectiveRegions.map(({ region }) => region);
      const equipments = detective.detectiveEquipments.map(({ equipment }) => equipment);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: '탐정프로필을 조회합니다.',
        data: {
          ...detective,
          detectiveCategories: categories,
          detectiveRegions: regions,
          detectiveEquipments: equipments,
        },
      });
    } catch (error) {
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        message: '탐정프로필을 조회할 수 없습니다.',
        error: error.message,
      });
    }
  }

  // 내 탐정 프로필 조회
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: '탐정 프로필 조회', description: '탐정 프로필 조회' })
  async getProfile(@UserInfo() user: Partial<User>, @Res() res: Response) {
    try {
      const userId = user.id;
      const role = user.role.name;
      if (role === 'client') {
        throw new BadRequestException('탐정 계정이 아닙니다.');
      }
      const profile = await this.detectiveService.findOneByUser(userId);
      console.log('profile:', profile);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '내 탐정 프로필을 조회합니다.',
        data: profile,
      });
    } catch (error) {
      return res.status(error.status).json({
        success: false,
        message: '내 탐정 프로필을 조회할 수 없습니다.',
        error: error.message,
      });
    }
  }

  // 탐정 프로필 수정
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @ApiConsumes('application/json')
  @ApiOperation({ summary: '탐정 프로필 수정', description: '탐정 프로필 수정' })
  @ApiBody({ type: UpdateDetectiveDto })
  async updateProfile(
    @UserInfo('id') userId: User['id'],
    @Body() dto: UpdateDetectiveDto,
    @Res() res: Response,
  ) {
    try {
      const user = await this.detectiveService.findUserDFile(userId);
      const detective = user.detective;
      if (!detective) {
        throw new BadRequestException('탐정 계정이 아닙니다.');
      }
      const updated = await this.detectiveService.update(detective.id, dto);
      if (updated.affected === 0) {
        throw new ConflictException('탐정 프로필 수정을 완료할 수 없습니다.');
      }
      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: '탐정 프로필을 수정 완료하였습니다.' });
    } catch (error) {
      return res.status(error.status).json({
        success: false,
        message: '탐정 프로필을 수정할 수 없습니다.',
        error: error.message,
      });
    }
  }

  // 탐정 프로필 사진 업로드
  @Post('profile/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @ApiBearerAuth('authorization')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateDetectiveProfileImageDto })
  @ApiOperation({
    summary: '내 탐정 프로필 이미지 생성',
    description: '내 탐정 프로필 이미지 생성',
  })
  async createProfileImage(
    @UserInfo('id') userId: User['id'],
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('파일을 업로드해주세요.');
      }
      const user = await this.detectiveService.findUserDFile(userId);
      const detective = user.detective;
      const path = file.filename;
      let result: number;

      if (detective.profile) {
        const imageId = detective.profile.id;
        const updated = await this.detectiveService.updateFile(imageId, { path });
        result = updated.affected;
      } else {
        const profile = await this.detectiveService.saveFile(path);
        if (!profile) {
          throw new ConflictException('탐정 프로필 이미지를 생성할 수 없습니다.');
        }

        const updated = await this.detectiveService.update(detective.id, { profile });
        result = updated.affected;
      }

      if (result !== 1) {
        throw new ConflictException('탐정 프로필 이미지를 수정할 수 없습니다.');
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '탐정 프로필 사진을 수정완료하였습니다.',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: '탐정 프로필을 수정할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @Post('category/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: '탐정 카테고리 추가', description: '탐정 카테고리 추가' })
  async createDCategory(
    @Param('id') categoryId: number,
    @UserInfo('id') userId: User['id'],
    @Res() res: Response,
  ) {
    try {
      const user = await this.detectiveService.findUserDC(userId);
      const detective = user.detective;
      if (!detective) {
        throw new BadRequestException('탐정 계정이 아닙니다.');
      }
      const dc = detective.detectiveCategories;
      const categories: Array<Category['id']> = dc.map(({ category }) => Number(category.id));
      if (categories.includes(categoryId)) {
        throw new ConflictException('해당 카테고리는 이미 등록 완료되었습니다.');
      }
      const category = await this.detectiveService.findCategory(categoryId);
      if (!category) {
        throw new BadRequestException('해당 카테고리는 존재하지 않습니다.');
      }
      const dCategory = await this.detectiveService.createDC(detective, category);
      if (!dCategory) {
        throw new ConflictException('detective category 생성을 실패하였습나다.');
      }

      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: '카테고리 추가를 완료하였습니다.',
      });
    } catch (error) {
      return res.status(error.status).json({
        success: false,
        message: '카테고리를 추가할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @Delete('category/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: '탐정 카테고리 삭제', description: '탐정 카테고리 삭제' })
  async removeDCategory(
    @UserInfo('id') userId: User['id'],
    @Param('id') categoryId: number,
    @Res() res: Response,
  ) {
    try {
      const user = await this.detectiveService.findUserDC(userId);
      const detective = user.detective;
      if (!detective) {
        throw new BadRequestException('탐정 계정이 아닙니다.');
      }
      const dcs: Array<DetectiveCategory> = detective.detectiveCategories;
      for (const dc of dcs) {
        if (Number(dc.category.id) === categoryId) {
          await this.detectiveService.removeDC(+dc.id);
          break;
        }
      }
      return res.status(HttpStatus.OK).json({
        success: true,
        message: '해당 카테고리를 프로필에서 삭제하였습니다.',
      });
    } catch (error) {
      return res.status(error.status).json({
        success: false,
        message: '해당 카테고리를 프로필에서 삭제할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @Post('equipment/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: '탐정 장비 추가', description: '탐정 장비 추가' })
  async createDEquipment(
    @UserInfo('id') userId: User['id'],
    @Param('id') equipmentId: number,
    @Res() res: Response,
  ) {
    try {
      const user = await this.detectiveService.findUserDE(userId);
      const detective = user.detective;
      if (!detective) {
        throw new BadRequestException('탐정 계정이 아닙니다.');
      }
      const des = detective.detectiveEquipments;
      const equipments: Array<Equipment['id']> = des.map(({ equipment }) => Number(equipment.id));
      if (equipments.includes(equipmentId)) {
        throw new ConflictException('해당 장비는 이미 등록 완료되었습니다.');
      }
      const equipment = await this.detectiveService.findEquipment(equipmentId);
      if (!equipment) {
        throw new BadRequestException('해당 장비는 존재하지 않습니다.');
      }
      const de = await this.detectiveService.createDE(detective, equipment);
      if (!de) {
        throw new ConflictException('detective equipment 생성에 실피했습니다.');
      }
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: '해당 장비를 프로필에 추가하였습니다.',
      });
    } catch (error) {
      return res.status(error.status).json({
        success: false,
        message: '해당 장비를 프로필에 추가할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @Delete('equipment/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: '탐정 장비 삭제', description: '탐정 장비 삭제' })
  async removeDEquipment(
    @UserInfo('id') userId: User['id'],
    @Param('id') equipmentId: number,
    @Res() res: Response,
  ) {
    try {
      const user = await this.detectiveService.findUserDE(userId);
      const detective = user.detective;
      if (!detective) {
        throw new BadRequestException('탐정 계정이 아닙니다.');
      }
      const des = detective.detectiveEquipments;
      for (const de of des) {
        if (Number(de.equipment.id) === equipmentId) {
          await this.detectiveService.removeDE(+de.id);
        }
        break;
      }
      return res.status(HttpStatus.OK).json({
        success: true,
        message: '해당 장비를 프로필에서 삭제하였습니다.',
      });
    } catch (error) {
      return res.status(error.status).json({
        success: false,
        message: '해당 장비를 프로필에서 삭제할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @Post('region/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: '탐정 지역 추가', description: '탐정 지역 추가' })
  async createDRegion(
    @UserInfo('id') userId: User['id'],
    @Param('id') regionId: number,
    @Res() res: Response,
  ) {
    try {
      const user = await this.detectiveService.findUserDR(userId);
      const detective = user.detective;
      if (!detective) {
        throw new BadRequestException('탐정 계정이 아닙니다.');
      }
      const drs = detective.detectiveRegions;
      const regions: Array<Region['id']> = drs.map(({ region }) => Number(region.id));
      if (regions.includes(regionId)) {
        throw new BadRequestException('해당 지역이 이미 프로필에 포함되어 있습니다.');
      }
      const region = await this.detectiveService.findRegion(regionId);
      const dr = await this.detectiveService.createDR(detective, region);
      if (!dr) {
        throw new ConflictException('detective region을 생성할 수 없습니다.');
      }
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: '해당 지역으로 프로필에 추가하였습니다.',
      });
    } catch (error) {
      return res.status(error.status).json({
        success: false,
        message: '해당 지역을 프로필에 추가할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @Delete('region/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: '탐정 지역 삭제', description: '탐정 지역 삭제' })
  async removeDR(
    @UserInfo('id') userId: User['id'],
    @Param('id') regionId: number,
    @Res() res: Response,
  ) {
    try {
      const user = await this.detectiveService.findUserDR(userId);
      const detective = user.detective;
      if (!detective) {
        throw new BadRequestException('탐정 계정이 아닙니다.');
      }
      const drs = detective.detectiveRegions;
      for (const dr of drs) {
        if (Number(dr.region.id) === regionId) {
          await this.detectiveService.removeDR(+dr.id);
          break;
        }
      }
      return res.status(HttpStatus.OK).json({
        success: true,
        message: '해당 지역을 프로필에서 삭제하였습니다.',
      });
    } catch (error) {
      return res.status(error.status).json({
        success: false,
        message: '해당 지역을 프로필에서 삭제할 수 없습니다.',
        error: error.message,
      });
    }
  }
}
