import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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

@ApiTags('Detective')
@Controller('detectives')
export class DetectiveController {
  constructor(private readonly detectiveService: DetectiveService) {}

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @ApiConsumes('application/json')
  @ApiOperation({ summary: '탐정 프로필 수정', description: '탐정 프로필 수정' })
  @ApiBody({ type: UpdateDetectiveDto })
  async updateProfile(
    @UserInfo() user: User,
    @Body() dto: UpdateDetectiveDto,
    @Query('id') id: number,
    @Res() res: Response,
  ) {
    try {
      const detective = await this.detectiveService.findOne(id);
      const postOwner = detective.user.id;
      if (postOwner !== user.id) {
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

  @Get(':id')
  @ApiOperation({ summary: '탐정 프로필 단일 조회', description: '탐정 프로필 단일 조회' })
  async findOne(@Query('id') id: number, @Res() res: Response) {
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
  async find(@Query() query: FindQueryDto, @Res() res: Response) {
    try {
      let posts;
      switch (query.key) {
        case findQueryKeyType.EQUIPMENT:
          posts = await this.detectiveService.findManyByEquipment(
            query.value,
            query.page,
            query.limit,
          );
          break;
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
        case findQueryKeyType.OFFICE:
          posts = await this.detectiveService.findManyByOffice(
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

  // 탐정 프로필 사진 업로드
  @Post(':id/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @ApiBearerAuth('authorization')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '탐정 프로필 이미지 생성', description: '탐정 프로필 이미지 생성' })
  async createProfileImage(
    @UserInfo() user: User,
    @Res() res: Response,
    @Query('id') id: number,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const detective = await this.detectiveService.findOne(id);
      const profileOwner = detective.user.id;
      if (profileOwner !== user.id) {
        throw new BadRequestException('작성자 본인이 아닙니다.');
      }
      if (!file) {
        throw new BadRequestException('파일을 업로드해주세요.');
      }
      const path = file.filename;
      const savedFile = await this.detectiveService.saveFile(path);
      Object.assign(savedFile, detective);
      const updatedPost = await this.detectiveService.updateFile(savedFile);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '탐정 프로필 사진을 수정완료하였습니다.',
        data: updatedPost,
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
  @Patch(':id/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @ApiBearerAuth('authorization')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '탐정 프로필 이미지 수정', description: '탐정 프로필 이미지 생성 수정' })
  async updateProfileImage(
    @UserInfo() user: User,
    @Res() res: Response,
    @Query('id') id: number,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const detective = await this.detectiveService.findOne(id);
      const postOwner = detective.user.id;
      if (postOwner !== user.id) {
        throw new BadRequestException('작성자 본인이 아닙니다.');
      }

      if (!file) {
        throw new BadRequestException('파일을 업로드해주세요.');
      }
      const profile = detective.profile;
      if (!profile) {
        throw new BadRequestException('수정할 프로필 이미지가 없습니다.');
      }
      const path = file.filename;
      Object.assign(profile, path);
      const savedFile = await this.detectiveService.updateFile(profile);

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

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  update(@Param('id') id: string, @Body() dto: UpdateDetectiveDto) {
    return this.detectiveService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  remove(@Param('id') id: string) {
    return this.detectiveService.remove(+id);
  }

  // 직원 등록 승인
  @Post(':id/employees')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: '오피스 직원 등록 승인', description: '오피스 직원 등록 승인' })
  async approve(
    @UserInfo() user: User,
    @Query('id') id: number,
    @Body() dto: { email: string },
    @Res() res: Response,
  ) {
    try {
      const foundOwner = await this.detectiveService.findUserById(user.id);
      if (!foundOwner.office || foundOwner.office.id !== id) {
        ('사업장이 존재하지 않거나 사업자 정보와 일치하지 않습니다.');
      }
      const foundUser = await this.detectiveService.findUserByEmail(dto.email);
      const detective = foundUser.detective;
      const office = foundOwner.office;
      await this.detectiveService.approve(detective, office);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '직원 등록을 성공적으로 완료하였습니다.',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: '직원 등록을 수행할 수 없습니다.',
        error: error.message,
      });
    }
  }
}
