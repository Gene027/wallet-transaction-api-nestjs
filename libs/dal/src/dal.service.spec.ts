import { Test, TestingModule } from '@nestjs/testing';
import { DalService } from './dal.service';

describe('DalService', () => {
  let service: DalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DalService],
    }).compile();

    service = module.get<DalService>(DalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
