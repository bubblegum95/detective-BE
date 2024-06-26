import { Controller, Post, Body, UploadedFile, Get, UseGuards, Param, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { S3Service } from '../s3/s3.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserInfo } from '../utils/decorator';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
  async filterPostsByCategory(@Param('categoryId') id: number) {
    const posts = await this.postService.filterPostsByCategory(id);
    return { data: posts };
  }

  @Get('/keyword')
  async findPostsByKeyword(@Query('key') key: string) {
    const data = await this.postService.findPostsByKeyword(key);
    return { data };
  }

  // 탐정 프로필 생성
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: '탐정 프로필 생성', description: '탐정 프로필 생성' })
  @ApiBody({ type: CreatePostDto })
  async createProfile(
    // @UploadedFile() file: Express.Multer.File,
    @Body() createPostDto: CreatePostDto,
  ) {
    // const uploadResult = await this.s3Service.uploadRegistrationFile(file);

    // createPostDto.profileImageUrl = uploadResult.Location;

    return this.postService.createProfile(createPostDto);
  }

  @Get()
  @ApiOperation({ summary: '테스트', description: '테스트' })
  testApi(@UserInfo() user: User) {
    console.log(user);
  }
}
