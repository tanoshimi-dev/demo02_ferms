import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacilityEntity } from './facility.entity';
import type { CreateFacilityDto, UpdateFacilityDto } from './admin-facility.dto';

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectRepository(FacilityEntity)
    private readonly facilitiesRepository: Repository<FacilityEntity>,
  ) {}

  private serializeFacilitySummary(facility: FacilityEntity) {
    return {
      id: facility.id,
      name: facility.name,
      description: facility.description,
      location: facility.location,
      isActive: facility.isActive,
      equipmentCount: facility.equipments.length,
    };
  }

  private serializeAdminFacility(facility: FacilityEntity) {
    return {
      id: facility.id,
      name: facility.name,
      description: facility.description,
      location: facility.location,
      isActive: facility.isActive,
      equipmentCount: facility.equipments.length,
      equipments: facility.equipments.map((equipment) => ({
        id: equipment.id,
        facilityId: equipment.facilityId,
        name: equipment.name,
        description: equipment.description,
        isActive: equipment.isActive,
      })),
      createdAt: facility.createdAt.toISOString(),
      updatedAt: facility.updatedAt.toISOString(),
    };
  }

  private async findFacilityEntityOrFail(id: string) {
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

    return facilities.map((facility) => this.serializeFacilitySummary(facility));
  }

  async listAdminFacilities() {
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

    return facilities.map((facility) => this.serializeAdminFacility(facility));
  }

  async getFacilityOrFail(id: string) {
    return this.findFacilityEntityOrFail(id);
  }

  async getAdminFacilityOrFail(id: string) {
    return this.serializeAdminFacility(await this.findFacilityEntityOrFail(id));
  }

  async createFacility(input: CreateFacilityDto) {
    const facility = await this.facilitiesRepository.save(
      this.facilitiesRepository.create({
        name: input.name.trim(),
        description: input.description.trim(),
        location: input.location.trim(),
        isActive: input.isActive ?? true,
      }),
    );

    return this.getAdminFacilityOrFail(facility.id);
  }

  async updateFacility(id: string, input: UpdateFacilityDto) {
    const facility = await this.findFacilityEntityOrFail(id);

    if (typeof input.name === 'string') {
      facility.name = input.name.trim();
    }
    if (typeof input.description === 'string') {
      facility.description = input.description.trim();
    }
    if (typeof input.location === 'string') {
      facility.location = input.location.trim();
    }
    if (typeof input.isActive === 'boolean') {
      facility.isActive = input.isActive;
    }

    await this.facilitiesRepository.save(facility);
    return this.getAdminFacilityOrFail(facility.id);
  }
}
