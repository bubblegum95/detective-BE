import {
  Controller,
  Post,
  Body,
  UploadedFile,
  Get,
  UseGuards,
  Param,
  Query,
  Delete,
  ValidationPipe,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { S3Service } from '../s3/s3.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserInfo } from '../utils/decorator';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Post')
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly s3Service: S3Service,
  ) {}

  // region별 조회
  @Get('/region/:regionId')
  async filterPostsByRegion(@Param('regionId') id: number) {
    const posts = await this.postService.filterPostsByRegion(id);
    return { data: posts };
  }

  @Get('/category/:categoryId')
  filterPostsByCategory(@Param('categoryId') id: number) {
    return this.postService.filterPostsByCategory(id);
  }

  @Get('/keyword')
  async findPostsByKeyword(@Query('key') key: string) {
    const data = await this.postService.findPostsByKeyword(key);
    return { data };
  }

  // 탐정 프로필 생성
  @UseGuards(JwtAuthGuard)
  @Post('profile')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '탐정 프로필 생성', description: '탐정 프로필 생성' })
  @ApiBody({ type: CreatePostDto })
  async createProfile(
    @UploadedFile() file: Express.Multer.File,
    @Body(new ValidationPipe()) createPostDto: CreatePostDto,
    @UserInfo() user: User,
  ) {
    const fileId = await this.postService.uploadFile(file);
    createPostDto.file = fileId;
    return this.postService.createProfile(createPostDto, user.id);
  }
}
