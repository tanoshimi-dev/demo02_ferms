import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from '../auth/auth.guard';
import { FacilitiesService } from './facilities.service';

@UseGuards(SessionAuthGuard)
@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Get()
  async listFacilities() {
    return {
      data: {
        items: await this.facilitiesService.listFacilities(),
      },
    };
  }

  @Get(':facilityId')
  async getFacility(@Param('facilityId') facilityId: string) {
    const facility = await this.facilitiesService.getFacilityOrFail(facilityId);

    return {
      data: {
        facility: {
          id: facility.id,
          name: facility.name,
          description: facility.description,
          location: facility.location,
          isActive: facility.isActive,
          equipments: facility.equipments.map((equipment) => ({
            id: equipment.id,
            facilityId: equipment.facilityId,
            name: equipment.name,
            description: equipment.description,
            isActive: equipment.isActive,
          })),
        },
      },
    };
  }
}
