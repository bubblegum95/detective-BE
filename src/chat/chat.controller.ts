import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../utils/guards/jwt-auth.guard';
import { UserInfo } from '../utils/decorators/user-info.decorator';
import { User } from '../user/entities/user.entity';
import { RoomService } from './room.service';
import { HttpExceptionFilter } from '../utils/filter/http-exception.filter';
import { Response } from 'express';
import { Room } from './entities/room.entity';
import { multerOptions } from '../utils/multerStorage';
import { ParticipantService } from './participant.service';
import { MessageService } from './message.service';
import { MessageType } from './type/message.type';

@UseGuards(JwtAuthGuard)
@ApiTags('Chats')
@ApiBearerAuth('authorization')
@UsePipes(new ValidationPipe({ transform: true }))
@UseFilters(HttpExceptionFilter)
@Controller('chats')
export class ChatController {
  constructor(
    private readonly roomService: RoomService,
    private readonly participantService: ParticipantService,
    private readonly messageService: MessageService,
  ) {}

  @Get()
  @ApiOperation({ description: '내 채팅방 가져오기', summary: '내 채팅방 가져오기' })
  async findMyChatRooms(@UserInfo('id') userId: User['id'], @Res() res: Response) {
    const rooms = await this.roomService.findMany(userId);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: '내 채팅방을 조회합니다.',
      data: rooms,
    });
  }

  @Post(':id')
  @ApiOperation({ description: '채팅방 파일 전송하기' })
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async createFiles(
    @Param('id') id: Room['id'],
    @UserInfo('id') userId: User['id'],
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const roomUser = await this.participantService.findByRoomUser(id, userId);
    if (!roomUser) {
      throw new UnauthorizedException('해당 채팅방 참여자가 아닙니다.');
    }
    const type = MessageType.File;
    const path = file.filename;
    const room = await this.roomService.findOne(id);
    const users = room.participants.map(({ id, createdAt, room, user }) => user);
    let readers: Array<User['id']> = [];
    for (const user of users) {
      readers.push(user.id);
    }

    const message = await this.messageService.create({
      sender: userId,
      type,
      content: path,
      room: id,
      read: readers,
    });

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: '채팅방에 파일을 전송했습니다.',
      data: message,
    });
  }
}
