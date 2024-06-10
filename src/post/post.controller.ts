import { Controller, Post, Body, UploadedFile } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { S3Service } from 'src/s3/s3.service';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly s3Service: S3Service,
  ) {}

  // 탐정 프로필 생성
  @Post()
  async createProfile(
    // @UploadedFile() file: Express.Multer.File,
    @Body() createPostDto: CreatePostDto,
  ) {
    // const uploadResult = await this.s3Service.uploadRegistrationFile(file);

    // createPostDto.profileImageUrl = uploadResult.Location;

    return this.postService.createProfile(createPostDto);
  }
}
