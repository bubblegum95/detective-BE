import {
  Controller,
  Get,
  HttpStatus,
  Inject,
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
import { User } from '../user/entities/user.entity';
import { RoomService } from './room.service';
import { HttpExceptionFilter } from '../utils/filter/http-exception.filter';
import { Response } from 'express';
import { Room } from './entities/room.entity';
import { multerOptions } from '../utils/multerStorage';
import { ParticipantService } from './participant.service';
import { MessageService } from './message.service';
import { MessageType } from './type/message.type';
import { ChatGateway } from './chat.gateway';
import { UserInfo } from '../utils/decorators/decorator';

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
    @Inject(ChatGateway) private readonly chatGateway: ChatGateway,
  ) {}

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
    const { readers, room } = await this.chatGateway.createReaders(userId, id);
    const message = await this.messageService.create({
      sender: userId,
      type,
      content: path,
      room: id,
      read: readers,
    });

    const foundSender = await this.roomService.findUser(userId);
    const sendMessage = {
      id: message.id,
      sender: foundSender.nickname,
      type: message.type,
      content: message.content,
      timestamp: message.timestamp,
      read: message.read.length,
    };
    await this.chatGateway.sendMessage(room, sendMessage);

    for (const reader of message.read) {
      const notice = await this.chatGateway.createNotification({
        receiver: reader,
        sender: message.sender,
        content: message.content,
        room: message.room,
        isRead: false,
      });
      const clientId = await this.chatGateway.getUserIdSocket(reader);
      if (!clientId) {
        // socket 이 연결되어 있을 경우에만 알람 전송
        continue;
      }
      await this.chatGateway.notify(clientId, notice);
    }

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: '채팅방에 파일을 전송했습니다.',
      data: message,
    });
  }
}
