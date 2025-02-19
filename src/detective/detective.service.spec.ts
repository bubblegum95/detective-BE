import { Test, TestingModule } from '@nestjs/testing';
import { DetectiveService } from './detective.service';

describe('DetectiveService', () => {
  let service: DetectiveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetectiveService],
    }).compile();

    service = module.get<DetectiveService>(DetectiveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
