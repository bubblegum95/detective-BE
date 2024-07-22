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
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserInfo } from '../utils/decorator';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { DetectivePost } from './entities/detective-post.entity';

@ApiTags('Post')
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly s3Service: S3Service,
  ) {}

  // region별 조회
  @Get('/region/:regionId')
  @ApiParam({ type: 'number', name: 'regionId', example: 1 })
  @ApiQuery({ type: 'number', name: 'page', example: 1 })
  async filterPostsByRegion(@Param('regionId') id: number, @Query('page') page: number = 1) {
    const posts = await this.postService.filterPostsByRegion(id, page);
    return { data: posts };
  }

  @Get('/category/:categoryId')
  @ApiParam({ type: 'number', name: 'categoryId', example: 1 })
  @ApiQuery({ type: 'number', name: 'page', example: 1 })
  async filterPostsByCategory(@Param('categoryId') id: number, @Query('page') page: number = 1) {
    const posts = await this.postService.filterPostsByCategory(id, page);
    return { posts };
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
    console.log('fileId:', fileId);
    createPostDto.file = fileId;
    return this.postService.createProfile(createPostDto, user.id);
  }
}
