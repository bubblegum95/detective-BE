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
import { User } from './entities/user.entity';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { hash } from 'bcrypt';
import { multerOptions } from '../utils/multerStorage';

@ApiTags('User')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('authorization')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '사용자 정보 조회', description: '사용자 정보 조회' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Get()
  async getUserInfo(@UserInfo() user: User, @Res() res: Response) {
    try {
      const data = await this.userService.returnFoundUser(user.id);
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

  @UseInterceptors(FileInterceptor('file', multerOptions))
  @ApiOperation({ summary: '사용자 정보 수정', description: '사용자 정보 수정' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'type' })
  @Patch('update')
  async updateUserInfo(
    @UserInfo() user: User,
    @Query('type') type: 'nickname' | 'password' | 'file',
    @Body() dto: UpdateUserDto,
    @Res() res: Response,
    @UploadedFile() file?: Express.Multer.File | undefined,
  ) {
    try {
      console.log('type:', type, 'dto:', dto, 'file:', file);
      let result = 0;
      switch (type) {
        case 'nickname':
          if (!dto.nickname) {
            throw new BadRequestException('닉네임을 입력해주세요.');
          }
          result = await this.userService.update(user.id, dto);
          break;

        case 'password':
          if (!dto.password || !dto.newPassword) {
            throw new BadRequestException('기존의 비밀번호와 변경하실 비밀번호를 입력해주세요.');
          }
          const userInfo = await this.userService.findOneById(user.id);
          const compared = await this.userService.verifyPassword(dto.password, userInfo.password);
          if (!compared) {
            throw new BadRequestException(
              '입력하신 비밀번호와 기존의 비밀번호가 일치하지 않습니다.',
            );
          }
          const hashedPassword = await hash(dto.newPassword, 10);
          result = await this.userService.update(user.id, { password: hashedPassword });
          break;

        case 'file':
          if (!file) {
            throw new BadRequestException('이미지를 업로드해주세요.');
          }
          const path = file.filename;
          const savedFile = await this.userService.updateUserPhoto(user.id, path);
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

  @Get('chatrooms')
  @ApiOperation({ summary: '사용자 채팅 목록', description: '사용자 채팅목록 불러오기' })
  @ApiConsumes('application/x-www-form-urlencoded')
  async getRooms(@UserInfo() user: User, @Res() res: Response) {
    try {
      const rooms = await this.userService.getAllChatRooms(user);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: '채팅 목록을 불러옵니다.',
        data: rooms,
      });
    } catch (error) {
      return res.status(HttpStatus.OK).json({
        success: false,
        message: error.message,
        error,
      });
    }
  }
}
