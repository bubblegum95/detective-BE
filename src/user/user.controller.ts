import {
  Controller,
  Get,
  UseGuards,
  Res,
  HttpStatus,
  Patch,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../utils/guards/jwt-auth.guard';
import { UserInfo } from '../utils/decorators/decorator';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { hash } from 'bcrypt';
import { multerOptions } from '../utils/multerStorage';
import { User } from './entities/user.entity';
import { UpdateUserQueryType } from './type/update-user-query.type';

@ApiTags('User')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('authorization')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '사용자 정보 조회', description: '사용자 정보 조회' })
  @Get()
  async getOne(@UserInfo('id') userId: User['id'], @Res() res: Response) {
    try {
      const data = await this.userService.findOneById(userId);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: '사용자 정보를 조회합니다.',
        data,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: '사용자 정보를 조회할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @ApiOperation({ summary: '사용자 정보 부분 조회', description: '사용자 정보 부분 조회' })
  @Get('partial')
  async getPartialOne(@UserInfo('id') userId: User['id'], @Res() res: Response) {
    try {
      const nickname = await this.userService.findOneByIdSelectNickname(userId);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: nickname,
      });
    } catch (error) {
      return res.status(error.status).json({
        success: false,
        message: '사용자 정보를 조회할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @UseInterceptors(FileInterceptor('file', multerOptions))
  @ApiOperation({ summary: '사용자 정보 수정', description: '사용자 정보 수정' })
  @ApiConsumes('multipart/form-data')
  @Patch()
  async updateUserInfo(
    @UserInfo('id') userId: number,
    @Query('type') type: UpdateUserQueryType,
    @Body() dto: UpdateUserDto,
    @Res() res: Response,
    @UploadedFile() file?: Express.Multer.File | undefined,
  ) {
    try {
      let result = 0;
      switch (type) {
        case UpdateUserQueryType.NICKNAME:
          if (!dto.nickname) {
            throw new BadRequestException('닉네임을 입력해주세요.');
          }
          result = await this.userService.update(userId, dto);
          break;

        case UpdateUserQueryType.PASSWORD:
          if (!dto.password || !dto.newPassword || !dto.passwordConfirm) {
            throw new BadRequestException('기존의 비밀번호와 변경하실 비밀번호를 입력해주세요.');
          }
          const userInfo = await this.userService.findOneByIdSelectPw(userId);
          const compared = await this.userService.verifyPassword(dto.password, userInfo.password);
          if (!compared) {
            throw new BadRequestException(
              '입력하신 비밀번호와 기존의 비밀번호가 일치하지 않습니다.',
            );
          }
          if (dto.newPassword !== dto.passwordConfirm) {
            throw new BadRequestException(
              '변경하실 비밀번호와 재확인 비밀번호가 일치하지 않습니다.',
            );
          }
          const hashedPassword = await hash(dto.newPassword, 10);
          result = await this.userService.update(userId, { password: hashedPassword });
          break;

        case UpdateUserQueryType.File:
          if (!file) {
            throw new BadRequestException('이미지를 업로드해주세요.');
          }
          const path = file.filename;
          const savedFile = await this.userService.updateUserPhoto(userId, path);
          result = savedFile;
          break;

        default:
          throw new BadRequestException('잘못된 타입입니다.');
      }

      if (result === 0) {
        throw new BadRequestException('업데이트를 완료할 수 없습니다.');
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '프로필을 성공적으로 수정하였습니다.',
      });
    } catch (error) {
      return res.status(HttpStatus.OK).json({
        success: false,
        message: error.message,
      });
    }
  }
}
