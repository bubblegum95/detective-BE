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
} from '@nestjs/common';
import { DetectiveService } from './detective.service';
import { UpdateDetectiveDto } from './dto/update-detective.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';
import { UserInfo } from '../utils/decorators/user-info.decorator';
import { JwtAuthGuard } from '../utils/guards/jwt-auth.guard';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../utils/multerStorage';
import { FindQueryDto } from './dto/find-query.dto';
import { findQueryKeyType } from './type/find-query-key.type';
import { Detective } from './entities/detective.entity';
import { File } from '../s3/entities/s3.entity';

@ApiTags('Detectives')
@Controller('detectives')
export class DetectiveController {
  constructor(private readonly detectiveService: DetectiveService) {}

  @Get(':id')
  @ApiOperation({ summary: '탐정 프로필 단일 조회', description: '탐정 프로필 단일 조회' })
  async findOne(@Param('id') id: number, @Res() res: Response) {
    try {
      const post = await this.detectiveService.findOne(id);
      if (!post) {
        throw new BadRequestException('해당 탐정 프로필이 존재하지 않습니다.');
      }
      return res.status(HttpStatus.OK).json({
        success: true,
        message: '탐정프로필을 조회합니다.',
        data: post,
      });
    } catch (error) {
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        message: '탐정프로필을 조회할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @Get() // 탐정 조회
  @ApiOperation({ summary: '탐정 조회', description: '탐정 조회' })
  async findMany(@Query() query: FindQueryDto, @Res() res: Response) {
    try {
      let posts;
      switch (query.key) {
        case findQueryKeyType.CATEGORY:
          posts = await this.detectiveService.findManyByCategory(
            query.value,
            query.page,
            query.limit,
          );
          break;
        case findQueryKeyType.REGION:
          posts = await this.detectiveService.findManyByRegion(
            query.value,
            query.page,
            query.limit,
          );
          break;
        default:
          posts = await this.detectiveService.findManyOrderByReviewCount(query.page, query.limit);
          break;
      }
      return res.status(HttpStatus.OK).json({
        success: true,
        message: '리뷰순 탐정 조회',
        data: posts,
      });
    } catch (error) {
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        message: '탐정조회를 완료할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @ApiConsumes('application/json')
  @ApiOperation({ summary: '탐정 프로필 수정', description: '탐정 프로필 수정' })
  @ApiBody({ type: UpdateDetectiveDto })
  async updateProfile(
    @UserInfo('id') userId: User['id'],
    @Body() dto: UpdateDetectiveDto,
    @Param('id') id: Detective['id'],
    @Res() res: Response,
  ) {
    try {
      const detective = await this.detectiveService.findOne(id);
      const postOwner = detective.user.id;
      if (postOwner !== userId) {
        throw new BadRequestException('작성자 본인이 아닙니다.');
      }

      const updated = await this.detectiveService.update(id, dto);
      if (updated.affected === 0) {
        throw new ConflictException('탐정 프로필 수정을 완료할 수 없습니다.');
      }
      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: '탐정 프로필을 수정 완료하였습니다.' });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: '탐정 프로필을 수정할 수 없습니다.',
        error: error.message,
      });
    }
  }

  // 탐정 프로필 사진 업로드
  @Post(':id/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @ApiBearerAuth('authorization')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '탐정 프로필 이미지 생성', description: '탐정 프로필 이미지 생성' })
  async createProfileImage(
    @UserInfo('id') userId: User['id'],
    @Res() res: Response,
    @Param('id') id: Detective['id'],
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const detective = await this.detectiveService.findOne(id);
      const profileOwner = detective.user.id;
      if (profileOwner !== userId) {
        throw new BadRequestException('작성자 본인이 아닙니다.');
      }
      if (!file) {
        throw new BadRequestException('파일을 업로드해주세요.');
      }
      const path = file.filename;
      const savedFile = await this.detectiveService.saveFile(path);
      const updated = await this.detectiveService.update(detective.id, { profile: savedFile });
      return res.status(HttpStatus.OK).json({
        success: true,
        message: '탐정 프로필 사진을 수정완료하였습니다.',
        data: updated,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: '탐정 프로필을 수정할 수 없습니다.',
        error: error.message,
      });
    }
  }

  // 탐정 프로필 사진 업데이트
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @ApiBearerAuth('authorization')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '탐정 프로필 이미지 수정', description: '탐정 프로필 이미지 생성 수정' })
  async updateProfileImage(
    @UserInfo('id') userId: User['id'],
    @Res() res: Response,
    @Param('id') id: File['id'],
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const image = await this.detectiveService.findFile(id);
      const owner = image.detective.user.id;
      if (!image) {
        throw new BadRequestException('수정할 프로필 이미지가 없습니다.');
      }
      if (owner !== userId) {
        throw new BadRequestException('작성자 본인이 아닙니다.');
      }
      if (!file) {
        throw new BadRequestException('파일을 업로드해주세요.');
      }
      const path = file.filename;
      const savedFile = await this.detectiveService.updateFile(image.id, { path });
      if (savedFile.affected !== 1) {
        throw new ConflictException('파일 업데이트를 완료할 수 없습니다.');
      }
      return res.status(HttpStatus.OK).json({
        success: true,
        message: '탐정 프로필 사진을 수정완료하였습니다.',
        data: savedFile,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: '탐정 프로필을 수정할 수 없습니다.',
        error: error.message,
      });
    }
  }
}
