import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserInfo } from '../utils/decorator';
import { User } from './entities/user.entity';
import { ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@ApiCookieAuth('JWT')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('chatrooms')
  @ApiOperation({ summary: '사용자 채팅 목록', description: '사용자 채팅목록 불러오기' })
  @ApiConsumes('application/x-www-form-urlencoded')
  async getRooms(@UserInfo() user: User, @Res() res) {
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
        message: error.message,
      });
    }
  }
}
