import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacilityEntity } from './facility.entity';

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectRepository(FacilityEntity)
    private readonly facilitiesRepository: Repository<FacilityEntity>,
  ) {}

  async listFacilities() {
    const facilities = await this.facilitiesRepository.find({
      relations: {
        equipments: true,
      },
      order: {
        name: 'ASC',
        equipments: {
          name: 'ASC',
        },
      },
    });

    return facilities.map((facility) => ({
      id: facility.id,
      name: facility.name,
      description: facility.description,
      location: facility.location,
      isActive: facility.isActive,
      equipmentCount: facility.equipments.length,
    }));
  }

  async getFacilityOrFail(id: string) {
    const facility = await this.facilitiesRepository.findOne({
      where: { id },
      relations: {
        equipments: true,
      },
      order: {
        equipments: {
          name: 'ASC',
        },
      },
    });

    if (!facility) {
      throw new NotFoundException({
        error: {
          code: 'facility_not_found',
          message: '施設が見つかりません。',
        },
      });
    }

    return facility;
  }
}
