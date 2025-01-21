import {
  Body,
  Controller,
  Logger,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiBody, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../utils/guards/jwt-auth.guard';
import { FileUploadDto } from '../s3/dto/file-upload.dto';
import { UserInfo } from '../utils/decorators/user-info.decorator';
import { S3Service } from '../s3/s3.service';
import { ChatGateway } from './chat.gateway';
import { User } from '../user/entities/user.entity';
import { MessageType } from './type/message.type';
import { UserService } from '../user/user.service';

@UseGuards(JwtAuthGuard)
@ApiTags('Chat')
@ApiCookieAuth('JWT')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly s3Service: S3Service,
    private readonly chatGateway: ChatGateway,
    private readonly userService: UserService,
  ) {}
  private readonly logger = new Logger(ChatController.name);

  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '채팅 파일 전송', description: '채팅 파일 전송' })
  @ApiBody({ type: FileUploadDto, description: '채팅 파일 전송 및 반환' })
  @Post('chatfile')
  async chatFileUpload(
    @UserInfo() user: User,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: FileUploadDto,
  ) {
    try {
      const uploadedFiles = await this.s3Service.uploadChatFiles(files);
      const uploadedFile = await this.chatService.createChat(
        user.id,
        MessageType.File,
        uploadedFiles,
        dto.room,
      );
      console.log('uploaded file: ', uploadedFile);

      const foundUserNickname = await this.userService.findUserNameById(user.id);

      const message = {
        sender: foundUserNickname,
        type: uploadedFile.type,
        content: uploadedFile.content,
        room: uploadedFile.room,
        timestamp: uploadedFile.timestamp,
      };

      await this.chatGateway.publishMessage(message);
      this.logger.log('upload chat files');

      return {
        success: true,
        message: '파일을 전송하였습니다.',
        data: {
          uploadedFiles,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: '파일 전송 실패: ' + error.message,
      };
    }
  }
}
