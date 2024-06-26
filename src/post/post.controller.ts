import { Controller, Post, Body, UploadedFile, Get, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { S3Service } from 'src/s3/s3.service';
import { RegionEnum } from './type/region.type';
import { CategoryEnum } from './type/category.type';
import { EquipmentEnum } from './type/equiment.type';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserInfo } from '../utils/user-info.decorator';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiTags('Post')
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly s3Service: S3Service,
  ) {}

  // 탐정 프로필 생성
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
