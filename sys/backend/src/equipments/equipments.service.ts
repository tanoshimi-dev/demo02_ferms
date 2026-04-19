import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipmentEntity } from './equipment.entity';

@Injectable()
export class EquipmentsService {
  constructor(
    @InjectRepository(EquipmentEntity)
    private readonly equipmentsRepository: Repository<EquipmentEntity>,
  ) {}

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

    return items.map((equipment) => ({
      id: equipment.id,
      facilityId: equipment.facilityId,
      facilityName: equipment.facility.name,
      name: equipment.name,
      description: equipment.description,
      isActive: equipment.isActive,
    }));
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
}
