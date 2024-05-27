import { Test, TestingModule } from '@nestjs/testing';
import { OfficeController } from './detectiveoffice.controller';
import { OfficeService } from './detectiveoffice.service';

describe('OfficeController', () => {
  let controller: OfficeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfficeController],
      providers: [OfficeService],
    }).compile();

    controller = module.get<OfficeController>(OfficeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
