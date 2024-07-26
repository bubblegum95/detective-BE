import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { S3Service } from './s3.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UserInfo } from '../utils/decorator';
import { User } from '../user/entities/user.entity';
import { FileUploadDto } from './dto/file-upload.dto';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('AWS S3')
@ApiCookieAuth('JWT')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @UseInterceptors(FilesInterceptor('files'))
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '채팅 파일 전송', description: '채팅 파일 전송' })
  @ApiBody({ type: FileUploadDto, description: '채팅 파일과 룸 이름을 포함하는 요청' })
  @Post('chatfile')
  async chatFileUpload(
    @UserInfo() user: User,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: FileUploadDto,
  ) {
    try {
      console.log(dto.room, files);
      const uploadedFiles = await this.s3Service.uploadChatFiles(user, dto.room, files);
      return {
        success: true,
        message: '파일을 성공적으로 업로드하였습니다.',
      };
    } catch (error) {
      return {
        success: false,
        message: '파일 전송 실패: ' + error.message,
      };
    }
  }
}
