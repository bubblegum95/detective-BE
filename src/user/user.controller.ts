import { Controller, Get, UseGuards, Res, HttpStatus, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../utils/guards/jwt-auth.guard';
import { UserInfo } from '../utils/decorators/decorator';
import { User } from './entities/user.entity';
import { ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('User')
@ApiCookieAuth('JWT')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '사용자 정보 조회', description: '사용자 정보 조회' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Get()
  async getUserInfo(@UserInfo() user: User, @Res() res: Response) {
    try {
      const data = await this.userService.findOneById(user.id);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: '사용자 정보를 조회합니다.',
        data,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: '사용자 정보를 조회할 수 없습니다.',
        error,
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '사용자 정보 수정', description: '사용자 정보 수정' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Patch('update')
  async updateUserInfo() {}

  @UseGuards(JwtAuthGuard)
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
      return res.json({
        success: false,
        message: '채팅 목록을 불러올 수 없습니다.',
        error,
      });
    }
  }
}
