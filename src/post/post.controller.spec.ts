import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { S3Service } from '../s3/s3.service';

describe('PostController', () => {
  let controller: PostController;
  let postService: PostService;
  let s3Service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: {
            filterPostsByRegion: jest.fn(),
            filterPostsByCategory: jest.fn(),
            findPostsByKeyword: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<PostController>(PostController);
    postService = module.get<PostService>(PostService);
    s3Service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // 각 메서드에 대한 테스트 케이스를 작성하세요
  describe('filterPostsByRegion', () => {
    test('region 별 조회 성공', async () => {
      const id: number = 1;
    });
  });

  describe('filterPostsByCategory', () => {
    // 테스트 케이스 작성
  });

  describe('findPostsByKeyword', () => {
    // 테스트 케이스 작성
  });
});
