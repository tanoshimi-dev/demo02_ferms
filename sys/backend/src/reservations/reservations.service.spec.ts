import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { ObjectLiteral, Repository } from 'typeorm';
import { ReservationsService } from './reservations.service';
import type { ReservationEntity } from './reservation.entity';
import type { FacilityEntity } from '../facilities/facility.entity';
import type { EquipmentEntity } from '../equipments/equipment.entity';

function createRepositoryMock<T extends ObjectLiteral>() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn((value: Partial<T>) => value as T),
  } as unknown as jest.Mocked<Repository<T>>;
}

describe('ReservationsService', () => {
  it('rejects invalid reservation windows', async () => {
    const reservationsRepository = createRepositoryMock<ReservationEntity>();
    const facilitiesRepository = createRepositoryMock<FacilityEntity>();
    const equipmentsRepository = createRepositoryMock<EquipmentEntity>();
    const service = new ReservationsService(
      reservationsRepository,
      facilitiesRepository,
      equipmentsRepository,
    );

    await expect(
      service.checkAvailability(
        'facility-001',
        new Date('2026-04-20T12:00:00.000Z'),
        new Date('2026-04-20T11:00:00.000Z'),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects conflicting reservations', async () => {
    const reservationsRepository = createRepositoryMock<ReservationEntity>();
    const facilitiesRepository = createRepositoryMock<FacilityEntity>();
    const equipmentsRepository = createRepositoryMock<EquipmentEntity>();
    const service = new ReservationsService(
      reservationsRepository,
      facilitiesRepository,
      equipmentsRepository,
    );

    facilitiesRepository.findOneBy.mockResolvedValue({
      id: 'facility-001',
      isActive: true,
    } as FacilityEntity);
    reservationsRepository.find.mockResolvedValue([
      {
        id: 'reservation-001',
        facility: { name: 'Creative Studio A' },
        equipment: null,
        user: { name: 'Demo User' },
        startAt: new Date('2026-04-20T10:00:00.000Z'),
        endAt: new Date('2026-04-20T11:00:00.000Z'),
      },
    ] as ReservationEntity[]);

    await expect(
      service.createReservation({
        user: {
          id: 'demo-user',
          email: 'demo@example.com',
          name: 'Demo User',
          role: 'user',
        },
        facilityId: 'facility-001',
        startAt: new Date('2026-04-20T10:00:00.000Z'),
        endAt: new Date('2026-04-20T11:00:00.000Z'),
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('cancels an existing reservation', async () => {
    const reservationsRepository = createRepositoryMock<ReservationEntity>();
    const facilitiesRepository = createRepositoryMock<FacilityEntity>();
    const equipmentsRepository = createRepositoryMock<EquipmentEntity>();
    const service = new ReservationsService(
      reservationsRepository,
      facilitiesRepository,
      equipmentsRepository,
    );

    reservationsRepository.findOne.mockResolvedValue({
      id: 'reservation-001',
      userId: 'demo-user',
      facilityId: 'facility-001',
      equipmentId: null,
      facility: { name: 'Creative Studio A' },
      equipment: null,
      user: { name: 'Demo User' },
      startAt: new Date('2026-04-20T10:00:00.000Z'),
      endAt: new Date('2026-04-20T11:00:00.000Z'),
      status: 'reserved',
      note: null,
      createdAt: new Date('2026-04-19T10:00:00.000Z'),
      updatedAt: new Date('2026-04-19T10:00:00.000Z'),
    } as ReservationEntity);
    reservationsRepository.save.mockResolvedValue({
      id: 'reservation-001',
      userId: 'demo-user',
      facilityId: 'facility-001',
      equipmentId: null,
      facility: { name: 'Creative Studio A' },
      equipment: null,
      user: { name: 'Demo User' },
      startAt: new Date('2026-04-20T10:00:00.000Z'),
      endAt: new Date('2026-04-20T11:00:00.000Z'),
      status: 'cancelled',
      note: null,
      createdAt: new Date('2026-04-19T10:00:00.000Z'),
      updatedAt: new Date('2026-04-19T10:00:00.000Z'),
    } as ReservationEntity);

    const result = await service.cancelReservation(
      'reservation-001',
      'demo-user',
    );

    expect(result.status).toBe('cancelled');
    expect(reservationsRepository.save.mock.calls).toHaveLength(1);
  });

  it('raises not found for a missing reservation', async () => {
    const reservationsRepository = createRepositoryMock<ReservationEntity>();
    const facilitiesRepository = createRepositoryMock<FacilityEntity>();
    const equipmentsRepository = createRepositoryMock<EquipmentEntity>();
    const service = new ReservationsService(
      reservationsRepository,
      facilitiesRepository,
      equipmentsRepository,
    );

    reservationsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.cancelReservation('reservation-unknown', 'demo-user'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists reservations for admin filters', async () => {
    const reservationsRepository = createRepositoryMock<ReservationEntity>();
    const facilitiesRepository = createRepositoryMock<FacilityEntity>();
    const equipmentsRepository = createRepositoryMock<EquipmentEntity>();
    const service = new ReservationsService(
      reservationsRepository,
      facilitiesRepository,
      equipmentsRepository,
    );

    reservationsRepository.find.mockResolvedValue([
      {
        id: 'reservation-001',
        userId: 'demo-user',
        facilityId: 'facility-001',
        equipmentId: null,
        facility: { name: 'Creative Studio A' },
        equipment: null,
        user: { name: 'Demo User' },
        startAt: new Date('2026-04-20T10:00:00.000Z'),
        endAt: new Date('2026-04-20T11:00:00.000Z'),
        status: 'reserved',
        note: null,
        createdAt: new Date('2026-04-19T10:00:00.000Z'),
        updatedAt: new Date('2026-04-19T10:00:00.000Z'),
      },
    ] as ReservationEntity[]);

    const items = await service.listAdminReservations({
      status: 'reserved',
      facilityId: 'facility-001',
    });

    expect(items).toHaveLength(1);
    expect(reservationsRepository.find).toHaveBeenCalled();
  });

  it('updates reservation status for admin operations', async () => {
    const reservationsRepository = createRepositoryMock<ReservationEntity>();
    const facilitiesRepository = createRepositoryMock<FacilityEntity>();
    const equipmentsRepository = createRepositoryMock<EquipmentEntity>();
    const service = new ReservationsService(
      reservationsRepository,
      facilitiesRepository,
      equipmentsRepository,
    );

    reservationsRepository.findOne.mockResolvedValue({
      id: 'reservation-001',
      userId: 'demo-user',
      facilityId: 'facility-001',
      equipmentId: null,
      facility: { name: 'Creative Studio A' },
      equipment: null,
      user: { name: 'Demo User' },
      startAt: new Date('2026-04-20T10:00:00.000Z'),
      endAt: new Date('2026-04-20T11:00:00.000Z'),
      status: 'reserved',
      note: 'Before',
      createdAt: new Date('2026-04-19T10:00:00.000Z'),
      updatedAt: new Date('2026-04-19T10:00:00.000Z'),
    } as ReservationEntity);
    reservationsRepository.save.mockResolvedValue({
      id: 'reservation-001',
      userId: 'demo-user',
      facilityId: 'facility-001',
      equipmentId: null,
      facility: { name: 'Creative Studio A' },
      equipment: null,
      user: { name: 'Demo User' },
      startAt: new Date('2026-04-20T10:00:00.000Z'),
      endAt: new Date('2026-04-20T11:00:00.000Z'),
      status: 'completed',
      note: 'Admin updated',
      createdAt: new Date('2026-04-19T10:00:00.000Z'),
      updatedAt: new Date('2026-04-19T10:00:00.000Z'),
    } as ReservationEntity);

    const result = await service.updateReservationStatus('reservation-001', {
      status: 'completed',
      note: 'Admin updated',
    });

    expect(result.status).toBe('completed');
    expect(result.note).toBe('Admin updated');
  });
});
