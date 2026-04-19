import { NotFoundException } from '@nestjs/common';
import type { ObjectLiteral, Repository } from 'typeorm';
import type { FacilityEntity } from '../facilities/facility.entity';
import { EquipmentsService } from './equipments.service';
import type { EquipmentEntity } from './equipment.entity';

function createRepositoryMock<T extends ObjectLiteral>() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn((value: Partial<T>) => value as T),
  } as unknown as jest.Mocked<Repository<T>>;
}

describe('EquipmentsService', () => {
  it('creates equipment for an existing facility', async () => {
    const equipmentsRepository = createRepositoryMock<EquipmentEntity>();
    const facilitiesRepository = createRepositoryMock<FacilityEntity>();
    const service = new EquipmentsService(
      equipmentsRepository,
      facilitiesRepository,
    );

    facilitiesRepository.findOneBy.mockResolvedValue({
      id: 'facility-001',
    } as FacilityEntity);
    equipmentsRepository.save.mockResolvedValue({
      id: 'equipment-001',
    } as EquipmentEntity);
    equipmentsRepository.findOne.mockResolvedValue({
      id: 'equipment-001',
      facilityId: 'facility-001',
      facility: {
        id: 'facility-001',
        name: 'Creative Studio A',
      },
      name: 'Projector',
      description: '4K projector',
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    } as EquipmentEntity);

    const result = await service.createEquipment({
      facilityId: 'facility-001',
      name: 'Projector',
      description: '4K projector',
      isActive: true,
    });

    expect(result.id).toBe('equipment-001');
    expect(result.facilityName).toBe('Creative Studio A');
  });

  it('rejects creation when the facility is missing', async () => {
    const equipmentsRepository = createRepositoryMock<EquipmentEntity>();
    const facilitiesRepository = createRepositoryMock<FacilityEntity>();
    const service = new EquipmentsService(
      equipmentsRepository,
      facilitiesRepository,
    );

    facilitiesRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.createEquipment({
        facilityId: 'facility-missing',
        name: 'Projector',
        description: '4K projector',
        isActive: true,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
