import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { S3Service } from '../s3/s3.service';
import { DetectivePost } from './entities/detective-post.entity';

const mockPostServices = () => ({
  filterPostsByRegion: jest.fn(),
  filterPostsByCategory: jest.fn(),
  findPostsByKeyword: jest.fn(),
});

describe('PostController', () => {
  let postController: PostController;
  let postService: PostService;
  let s3Service: S3Service;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: mockPostServices(),
        },
        {
          provide: S3Service,
          useValue: {},
        },
      ],
    }).compile();

    postController = module.get<PostController>(PostController);
    postService = module.get<PostService>(PostService);
    s3Service = module.get<S3Service>(S3Service);
  });
  it('should be defined', () => {
    expect(postController).toBeDefined();
  });
  describe('filterPostsByRegion', () => {
    test('region 별 조회 성공', async () => {
      const regionId = 1;
      const mockPosts = [];

      (postService.filterPostsByRegion as jest.Mock).mockResolvedValue(mockPosts);

      const posts = await postController.filterPostsByRegion(regionId);

      expect(postService.filterPostsByRegion).toHaveBeenCalledWith(regionId);
      expect(postService.filterPostsByRegion).toHaveReturnedTimes(1);
      expect(posts).toEqual({ data: mockPosts });
    });
  });

  describe('filterPostsByCategory', () => {
    test('category별 조회 성공', async () => {
      const categoryId = 1;
      const mockPosts: DetectivePost[] = [];

      (postService.filterPostsByCategory as jest.Mock).mockResolvedValue(mockPosts);
      const posts = await postService.filterPostsByCategory(categoryId);

      expect(postService.filterPostsByRegion).toHaveBeenCalledWith(categoryId);
      expect(postService.filterPostsByRegion).toHaveReturnedTimes(1);
      expect(posts).toEqual({ data: mockPosts });
    });
  });

  describe('findPostsByKeyword', () => {
    test('keyword 별 조회 성공', async () => {
      const keyword = '홍길동';
    });
    test('keyword 별 조회 성공 - data가 비었을 때', async () => {});
  });
});
