import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { Repository } from 'typeorm';
import puppeteer from 'puppeteer';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepo: Repository<News>,
  ) {}

  // 탐정 뉴스 저장
  async saveNews() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const getNewsIdsUrl = 'http://www.idtt.co.kr/atl/category.asp?cate=2';
    try {
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      );

      await page.goto(getNewsIdsUrl, {
        timeout: 60000,
        waitUntil: 'networkidle0',
      });

      const newsIds = await page.$$eval('div.weekly-hotissue ul li a', (links) => {
        return links
          .map((link) => {
            const href = link.href;
            const match = href.match(/a_id=(\d+)/);
            return match[1];
          })
          .filter((id) => id !== null);
      });

      console.log('Ids:', newsIds);

      const news = [];
      for (const id of newsIds) {
        try {
          const newsUrl = `http://www.idtt.co.kr/atl/view.asp?a_id=${id}`;
          await page.goto(newsUrl, {
            timeout: 30000,
            waitUntil: 'domcontentloaded',
          });

          const newsData = await page.evaluate(() => {
            const mainText = document.querySelector('#main-text');
            if (!mainText) return null;
            const title = document.querySelector('div.title').textContent?.trim();
            const imageElement = mainText.querySelector(
              'a[data-lightbox="image-1"] img',
            ) as HTMLImageElement;
            const screenShot = imageElement ? imageElement.src : null;
            const screenShotDescription = document.querySelector('font')?.textContent?.trim();

            console.log('Screen Shot Description:', screenShotDescription);

            const contentNodes = Array.from(mainText.childNodes).filter(
              (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim().length > 0,
            );
            const content = contentNodes
              .map((node) => node.textContent?.trim())
              .filter((text) => text && text.length > 0)
              .join(' ');
            return { title, screenShot, screenShotDescription, content };
          });

          const rank = news.length + 1;

          news.push({
            rank,
            screenShot: newsData.screenShot,
            screenShotDescription: newsData.screenShotDescription,
            content: newsData.content,
          });
          console.log(`Successfully fetched news with id: ${id}`);
        } catch (error) {
          console.log(`Error fetching news with id ${id}:`, error.message);
        }
      }
      await this.newsRepo.save(news);
    } catch (error) {
      console.log('Error fetching news Ids', error);
    } finally {
      await browser.close();
    }
  }

  // 탐정 뉴스 조회
  async getNews() {
    const news = await this.newsRepo.find({
      select: ['rank', 'screenShot', 'screenShotDescription', 'content'],
    });

    return news;
  }
}
