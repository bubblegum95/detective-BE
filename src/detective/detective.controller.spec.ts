import { Test, TestingModule } from '@nestjs/testing';
import { DetectiveController } from './detective.controller';
import { DetectiveService } from './detective.service';

describe('DetectiveController', () => {
  let controller: DetectiveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetectiveController],
      providers: [DetectiveService],
    }).compile();

    controller = module.get<DetectiveController>(DetectiveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
