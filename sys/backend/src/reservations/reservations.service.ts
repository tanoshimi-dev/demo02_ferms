import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import type { AuthUser } from '../auth/auth.types';
import { EquipmentEntity } from '../equipments/equipment.entity';
import { FacilityEntity } from '../facilities/facility.entity';
import { ReservationEntity } from './reservation.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(ReservationEntity)
    private readonly reservationsRepository: Repository<ReservationEntity>,
    @InjectRepository(FacilityEntity)
    private readonly facilitiesRepository: Repository<FacilityEntity>,
    @InjectRepository(EquipmentEntity)
    private readonly equipmentsRepository: Repository<EquipmentEntity>,
  ) {}

  private validateWindow(startAt: Date, endAt: Date): void {
    if (
      Number.isNaN(startAt.getTime()) ||
      Number.isNaN(endAt.getTime()) ||
      startAt >= endAt
    ) {
      throw new BadRequestException({
        error: {
          code: 'invalid_reservation_window',
          message: '予約開始日時は終了日時より前でなければなりません。',
        },
      });
    }
  }

  private async resolveTargets(facilityId: string, equipmentId?: string) {
    const facility = await this.facilitiesRepository.findOneBy({
      id: facilityId,
    });
    if (!facility) {
      throw new NotFoundException({
        error: {
          code: 'facility_not_found',
          message: '施設が見つかりません。',
        },
      });
    }
    if (!facility.isActive) {
      throw new BadRequestException({
        error: {
          code: 'facility_inactive',
          message: '無効化された施設には予約できません。',
        },
      });
    }

    let equipment: EquipmentEntity | null = null;
    if (equipmentId) {
      equipment = await this.equipmentsRepository.findOneBy({
        id: equipmentId,
      });
      if (!equipment) {
        throw new NotFoundException({
          error: {
            code: 'equipment_not_found',
            message: '設備が見つかりません。',
          },
        });
      }
      if (!equipment.isActive || equipment.facilityId !== facilityId) {
        throw new BadRequestException({
          error: {
            code: 'equipment_unavailable',
            message: '指定した設備には予約できません。',
          },
        });
      }
    }

    return {
      facility,
      equipment,
    };
  }

  async checkAvailability(facilityId: string, startAt: Date, endAt: Date) {
    this.validateWindow(startAt, endAt);

    const conflicts = await this.reservationsRepository.find({
      where: {
        facilityId,
        status: 'reserved',
        startAt: LessThan(endAt),
        endAt: MoreThan(startAt),
      },
      relations: {
        facility: true,
        equipment: true,
        user: true,
      },
      order: {
        startAt: 'ASC',
      },
    });

    return {
      available: conflicts.length === 0,
      conflicts: conflicts.map((reservation) => ({
        id: reservation.id,
        facilityName: reservation.facility.name,
        equipmentName: reservation.equipment?.name ?? null,
        userName: reservation.user.name,
        startAt: reservation.startAt.toISOString(),
        endAt: reservation.endAt.toISOString(),
      })),
    };
  }

  async createReservation(input: {
    user: AuthUser;
    facilityId: string;
    equipmentId?: string;
    startAt: Date;
    endAt: Date;
    note?: string;
  }) {
    this.validateWindow(input.startAt, input.endAt);
    await this.resolveTargets(input.facilityId, input.equipmentId);

    const availability = await this.checkAvailability(
      input.facilityId,
      input.startAt,
      input.endAt,
    );
    if (!availability.available) {
      throw new ConflictException({
        error: {
          code: 'reservation_conflict',
          message: '同一時間帯の予約がすでに存在します。',
        },
      });
    }

    const reservation = await this.reservationsRepository.save(
      this.reservationsRepository.create({
        userId: input.user.id,
        facilityId: input.facilityId,
        equipmentId: input.equipmentId ?? null,
        startAt: input.startAt,
        endAt: input.endAt,
        note: input.note?.trim() || null,
        status: 'reserved',
      }),
    );

    return this.getReservationForUserOrFail(reservation.id, input.user.id);
  }

  async listReservationsForUser(userId: string) {
    const items = await this.reservationsRepository.find({
      where: {
        userId,
      },
      relations: {
        facility: true,
        equipment: true,
      },
      order: {
        startAt: 'DESC',
      },
    });

    return items.map((reservation) => this.serializeReservation(reservation));
  }

  async getReservationForUserOrFail(id: string, userId: string) {
    const reservation = await this.reservationsRepository.findOne({
      where: {
        id,
        userId,
      },
      relations: {
        facility: true,
        equipment: true,
        user: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException({
        error: {
          code: 'reservation_not_found',
          message: '予約が見つかりません。',
        },
      });
    }

    return this.serializeReservation(reservation);
  }

  async cancelReservation(id: string, userId: string) {
    const reservation = await this.reservationsRepository.findOne({
      where: {
        id,
        userId,
      },
      relations: {
        facility: true,
        equipment: true,
        user: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException({
        error: {
          code: 'reservation_not_found',
          message: '予約が見つかりません。',
        },
      });
    }

    reservation.status = 'cancelled';
    await this.reservationsRepository.save(reservation);
    return this.serializeReservation(reservation);
  }

  private serializeReservation(reservation: ReservationEntity) {
    return {
      id: reservation.id,
      userId: reservation.userId,
      userName: reservation.user?.name ?? null,
      facilityId: reservation.facilityId,
      facilityName: reservation.facility.name,
      equipmentId: reservation.equipmentId,
      equipmentName: reservation.equipment?.name ?? null,
      startAt: reservation.startAt.toISOString(),
      endAt: reservation.endAt.toISOString(),
      status: reservation.status,
      note: reservation.note,
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
    };
  }
}
