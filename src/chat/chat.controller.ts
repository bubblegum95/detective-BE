import {
  Body,
  Controller,
  Inject,
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
import { ApiConsumes, ApiOperation, ApiBody, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../utils/guards/jwt-auth.guard';
import { FileUploadDto } from '../s3/dto/file-upload.dto';
import { UserInfo } from '../utils/decorators/user-info.decorator';
import { S3Service } from '../s3/s3.service';
import { User } from '../user/entities/user.entity';
import { ClientProxy } from '@nestjs/microservices';

@UseGuards(JwtAuthGuard)
@ApiTags('Chat')
@ApiBearerAuth('authorization')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('chat')
export class ChatController {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: ClientProxy,
    private readonly chatService: ChatService,
    private readonly s3Service: S3Service,
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
      const uploadedFiles = (await this.s3Service.uploadFilesToS3('chat', files)) as string[];
      const message = await this.chatService.saveMassage(user, dto.roomId, uploadedFiles);
      this.redisClient.emit('message_to_redis', message);
      // return {
      //   success: true,
      //   message: '파일을 전송하였습니다.',
      //   data: {
      //     uploadedFiles,
      //   },
      // };
    } catch (error) {
      return {
        success: false,
        message: '파일 전송 실패: ' + error.message,
      };
    }
  }
}
