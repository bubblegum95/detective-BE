import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
