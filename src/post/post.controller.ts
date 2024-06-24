import {
  Controller,
  Post,
  Body,
  UploadedFile,
  Get,
  Param,
  Query,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { S3Service } from 'src/s3/s3.service';

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
  filterPostsByCategory(@Param('categoryId') id: string) {
    return this.postService.filterPostsByCategory(+id);
  }

  @Get('/keyword')
  async findPostsByKeyword(@Query('key') key: string) {
    const data = await this.postService.findPostsByKeyword(key);
    return { data };
  }

  // 탐정 프로필 생성
  @Post('post')
  async createProfile(
    @UploadedFile() file: Express.Multer.File,
    @Body(new ValidationPipe()) createPostDto: CreatePostDto,
  ) {
    // const uploadResult = await this.s3Service.uploadRegistrationFile(file);

    // createPostDto.profileImageUrl = uploadResult.Location;

    return await this.postService.createProfile(createPostDto);
  }
}
