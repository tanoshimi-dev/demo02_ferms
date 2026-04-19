import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacilityEntity } from '../facilities/facility.entity';
import { EquipmentEntity } from './equipment.entity';
import type { CreateEquipmentDto, UpdateEquipmentDto } from './admin-equipment.dto';

@Injectable()
export class EquipmentsService {
  constructor(
    @InjectRepository(EquipmentEntity)
    private readonly equipmentsRepository: Repository<EquipmentEntity>,
    @InjectRepository(FacilityEntity)
    private readonly facilitiesRepository: Repository<FacilityEntity>,
  ) {}

  private serializeEquipmentSummary(equipment: EquipmentEntity) {
    return {
      id: equipment.id,
      facilityId: equipment.facilityId,
      facilityName: equipment.facility.name,
      name: equipment.name,
      description: equipment.description,
      isActive: equipment.isActive,
    };
  }

  private serializeAdminEquipment(equipment: EquipmentEntity) {
    return {
      ...this.serializeEquipmentSummary(equipment),
      createdAt: equipment.createdAt.toISOString(),
      updatedAt: equipment.updatedAt.toISOString(),
    };
  }

  private async ensureFacilityExists(facilityId: string) {
    const facility = await this.facilitiesRepository.findOneBy({ id: facilityId });
    if (!facility) {
      throw new NotFoundException({
        error: {
          code: 'facility_not_found',
          message: '施設が見つかりません。',
        },
      });
    }
  }

  async listEquipments(facilityId?: string) {
    const items = await this.equipmentsRepository.find({
      where: facilityId ? { facilityId } : {},
      relations: {
        facility: true,
      },
      order: {
        facility: {
          name: 'ASC',
        },
        name: 'ASC',
      },
    });

    return items.map((equipment) => this.serializeEquipmentSummary(equipment));
  }

  async listAdminEquipments(facilityId?: string) {
    const items = await this.equipmentsRepository.find({
      where: facilityId ? { facilityId } : {},
      relations: {
        facility: true,
      },
      order: {
        facility: {
          name: 'ASC',
        },
        name: 'ASC',
      },
    });

    return items.map((equipment) => this.serializeAdminEquipment(equipment));
  }

  async getEquipmentOrFail(id: string) {
    const equipment = await this.equipmentsRepository.findOne({
      where: { id },
      relations: {
        facility: true,
      },
    });

    if (!equipment) {
      throw new NotFoundException({
        error: {
          code: 'equipment_not_found',
          message: '設備が見つかりません。',
        },
      });
    }

    return equipment;
  }

  async getAdminEquipmentOrFail(id: string) {
    return this.serializeAdminEquipment(await this.getEquipmentOrFail(id));
  }

  async createEquipment(input: CreateEquipmentDto) {
    await this.ensureFacilityExists(input.facilityId);

    const equipment = await this.equipmentsRepository.save(
      this.equipmentsRepository.create({
        facilityId: input.facilityId,
        name: input.name.trim(),
        description: input.description.trim(),
        isActive: input.isActive ?? true,
      }),
    );

    return this.getAdminEquipmentOrFail(equipment.id);
  }

  async updateEquipment(id: string, input: UpdateEquipmentDto) {
    const equipment = await this.getEquipmentOrFail(id);

    if (typeof input.facilityId === 'string') {
      await this.ensureFacilityExists(input.facilityId);
      equipment.facilityId = input.facilityId;
    }
    if (typeof input.name === 'string') {
      equipment.name = input.name.trim();
    }
    if (typeof input.description === 'string') {
      equipment.description = input.description.trim();
    }
    if (typeof input.isActive === 'boolean') {
      equipment.isActive = input.isActive;
    }

    await this.equipmentsRepository.save(equipment);
    return this.getAdminEquipmentOrFail(equipment.id);
  }
}
