import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { S3Service } from '../s3/s3.service';

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
    expect(postService).toBeDefined();
  });

  //! region, category 가 다를 경우도??
  describe('filterPostsByRegion', () => {
    test('region 별 조회 성공 - 데이터가 존재할 때', async () => {
      const regionId = 1;
      const page = 1;
      const mockPosts = [
        {
          detectivePost_office_id: 1,
          detectivePost_region_id: 1,
          detectivePost_category_id: 1,
          user_name: '홍길동',
        },
        {
          detectivePost_office_id: 2,
          detectivePost_region_id: 1,
          detectivePost_category_id: 2,
          user_name: '홍길순',
        },
      ];

      (postService.filterPostsByRegion as jest.Mock).mockResolvedValue(mockPosts);

      const posts = await postService.filterPostsByRegion(regionId, page);

      expect(postService.filterPostsByRegion).toHaveBeenCalledWith(regionId);
      expect(postService.filterPostsByRegion).toHaveReturnedTimes(1);
      expect(posts).toEqual(mockPosts);
    });

    test('region별 조회 성공 - 데이터가 존재하지 않을 때', async () => {
      const regionId = 2;
      const page = 1;
      const mockPosts = [];

      jest.spyOn(postService, 'filterPostsByRegion').mockResolvedValue(mockPosts);

      const posts = await postService.filterPostsByRegion(regionId, page);

      expect(postService.filterPostsByRegion).toHaveBeenCalledWith(regionId);
      expect(postService.filterPostsByRegion).toHaveReturnedTimes(1);
      expect(posts).toEqual(mockPosts);
    });
  });

  describe('filterPostsByCategory', () => {
    test('category별 조회 성공', async () => {
      const categoryId = 1;
      const page = 1;
      const mockPosts = [
        {
          dp_office_id: 1,
          dp_region_id: 1,
          dp_category_id: 1,
          u_name: '홍길동',
        },
        {
          detectivePost_office_id: 2,
          detectivePost_region_id: 2,
          detectivePost_category_id: 2,
          user_name: '홍길순',
        },
      ];

      (postService.filterPostsByCategory as jest.Mock).mockResolvedValue(mockPosts);
      const posts = await postService.filterPostsByCategory(categoryId, page);

      expect(postService.filterPostsByCategory).toHaveBeenCalledWith(categoryId);
      expect(postService.filterPostsByCategory).toHaveReturnedTimes(1);
      expect(posts).toEqual(mockPosts);
    });
  });

  describe('findPostsByKeyword', () => {
    test('keyword 별 조회 성공', async () => {
      const key: any = '홍길동';
      const mockData = {
        detectives: [
          {
            detectivePost_office_id: 1,
            detectivePost_region_id: 1,
            detectivePost_category_id: 1,
            user_name: '홍길동',
          },
        ],
        offices: [],
      };
      (postService.findPostsByKeyword as jest.Mock).mockResolvedValue(mockData);

      const posts = await postService.findPostsByKeyword(key);

      expect(postService.findPostsByKeyword).toHaveBeenCalledWith(key);
      expect(postService.findPostsByKeyword).toHaveReturnedTimes(1);
      expect(posts).toEqual(mockData);
    });
  });
});
