import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let healthService: HealthService;
  const query = jest.fn().mockResolvedValue([{ '?column?': 1 }]);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: DataSource,
          useValue: { query },
        },
      ],
    }).compile();

    healthService = module.get<HealthService>(HealthService);
  });

  it('returns ok status when database responds', async () => {
    const result = await healthService.getHealth();

    expect(query).toHaveBeenCalledWith('SELECT 1');
    expect(result.name).toBe('demo02_ferms-backend');
    expect(result.status).toBe('ok');
    expect(result.services).toEqual({
      api: 'ok',
      database: 'ok',
    });
  });
});
