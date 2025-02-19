import { Controller, Get, Post } from '@nestjs/common';
import { NewsService } from './news.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('news')
@ApiTags('News')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // 탐정 뉴스 저장
  @Post()
  async saveNews() {
    const news = await this.newsService.saveNews();
    return news;
  }

  // 탐정 뉴스 조회
  @Get()
  async getNews() {
    const news = await this.newsService.getNews();
    return news;
  }
}
