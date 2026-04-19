import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../auth/admin.guard';
import { CreateFacilityDto, UpdateFacilityDto } from './admin-facility.dto';
import { FacilitiesService } from './facilities.service';

@UseGuards(AdminAuthGuard)
@Controller('admin/facilities')
export class AdminFacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Get()
  async listFacilities() {
    return {
      data: {
        items: await this.facilitiesService.listAdminFacilities(),
      },
    };
  }

  @Get(':facilityId')
  async getFacility(@Param('facilityId') facilityId: string) {
    return {
      data: {
        facility: await this.facilitiesService.getAdminFacilityOrFail(facilityId),
      },
    };
  }

  @Post()
  async createFacility(@Body() body: CreateFacilityDto) {
    return {
      data: {
        facility: await this.facilitiesService.createFacility(body),
      },
    };
  }

  @Patch(':facilityId')
  async updateFacility(
    @Param('facilityId') facilityId: string,
    @Body() body: UpdateFacilityDto,
  ) {
    return {
      data: {
        facility: await this.facilitiesService.updateFacility(facilityId, body),
      },
    };
  }
}
