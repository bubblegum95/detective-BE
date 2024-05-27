import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { DetectivePost } from './entities/detective-post.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(DetectivePost)
    private detectivePostRepo: Repository<DetectivePost>,
  ) {}
  async createProfile(file: Express.Multer.File, createPostDto: CreatePostDto) {
    const uploadResult = await s3.upload({
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    return;
  }
}
