import { Test, TestingModule } from '@nestjs/testing';
import { SQSService } from './sqs.service';

describe('SQSService', () => {
  let service: SQSService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SQSService],
    }).compile();

    service = module.get<SQSService>(SQSService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
