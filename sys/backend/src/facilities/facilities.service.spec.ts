import { NotFoundException } from '@nestjs/common';
import type { ObjectLiteral, Repository } from 'typeorm';
import { FacilitiesService } from './facilities.service';
import type { FacilityEntity } from './facility.entity';

function createRepositoryMock<T extends ObjectLiteral>() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn((value: Partial<T>) => value as T),
  } as unknown as jest.Mocked<Repository<T>>;
}

describe('FacilitiesService', () => {
  it('creates a facility for admin operations', async () => {
    const facilitiesRepository = createRepositoryMock<FacilityEntity>();
    const service = new FacilitiesService(facilitiesRepository);

    facilitiesRepository.save.mockResolvedValue({
      id: 'facility-001',
    } as FacilityEntity);
    facilitiesRepository.findOne.mockResolvedValue({
      id: 'facility-001',
      name: 'Creative Studio C',
      description: 'Admin created',
      location: 'Tokyo / Floor 7',
      isActive: true,
      equipments: [],
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    } as FacilityEntity);

    const result = await service.createFacility({
      name: 'Creative Studio C',
      description: 'Admin created',
      location: 'Tokyo / Floor 7',
      isActive: true,
    });

    expect(result.id).toBe('facility-001');
    expect(result.name).toBe('Creative Studio C');
  });

  it('updates an existing facility', async () => {
    const facilitiesRepository = createRepositoryMock<FacilityEntity>();
    const service = new FacilitiesService(facilitiesRepository);

    facilitiesRepository.findOne
      .mockResolvedValueOnce({
        id: 'facility-001',
        name: 'Creative Studio A',
        description: 'Before',
        location: 'Tokyo / Floor 3',
        isActive: true,
        equipments: [],
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      } as FacilityEntity)
      .mockResolvedValueOnce({
        id: 'facility-001',
        name: 'Creative Studio Updated',
        description: 'After',
        location: 'Tokyo / Floor 8',
        isActive: false,
        equipments: [],
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      } as FacilityEntity);
    facilitiesRepository.save.mockResolvedValue({
      id: 'facility-001',
    } as FacilityEntity);

    const result = await service.updateFacility('facility-001', {
      name: 'Creative Studio Updated',
      description: 'After',
      location: 'Tokyo / Floor 8',
      isActive: false,
    });

    expect(result.isActive).toBe(false);
    expect(result.name).toBe('Creative Studio Updated');
  });

  it('raises not found for an unknown facility', async () => {
    const facilitiesRepository = createRepositoryMock<FacilityEntity>();
    const service = new FacilitiesService(facilitiesRepository);

    facilitiesRepository.findOne.mockResolvedValue(null);

    await expect(
      service.updateFacility('facility-missing', {
        isActive: false,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
