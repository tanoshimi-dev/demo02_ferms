import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from '../auth/auth.guard';
import { EquipmentsService } from './equipments.service';

@UseGuards(SessionAuthGuard)
@Controller('equipments')
export class EquipmentsController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

  @Get()
  async listEquipments(@Query('facilityId') facilityId?: string) {
    return {
      data: {
        items: await this.equipmentsService.listEquipments(facilityId),
      },
    };
  }

  @Get(':equipmentId')
  async getEquipment(@Param('equipmentId') equipmentId: string) {
    const equipment =
      await this.equipmentsService.getEquipmentOrFail(equipmentId);

    return {
      data: {
        equipment: {
          id: equipment.id,
          facilityId: equipment.facilityId,
          facilityName: equipment.facility.name,
          name: equipment.name,
          description: equipment.description,
          isActive: equipment.isActive,
        },
      },
    };
  }
}
