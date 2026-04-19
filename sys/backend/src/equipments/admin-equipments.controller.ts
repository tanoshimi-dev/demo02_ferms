import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../auth/admin.guard';
import { CreateEquipmentDto, UpdateEquipmentDto } from './admin-equipment.dto';
import { EquipmentsService } from './equipments.service';

@UseGuards(AdminAuthGuard)
@Controller('admin/equipments')
export class AdminEquipmentsController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

  @Get()
  async listEquipments(@Query('facilityId') facilityId?: string) {
    return {
      data: {
        items: await this.equipmentsService.listAdminEquipments(facilityId),
      },
    };
  }

  @Get(':equipmentId')
  async getEquipment(@Param('equipmentId') equipmentId: string) {
    return {
      data: {
        equipment: await this.equipmentsService.getAdminEquipmentOrFail(equipmentId),
      },
    };
  }

  @Post()
  async createEquipment(@Body() body: CreateEquipmentDto) {
    return {
      data: {
        equipment: await this.equipmentsService.createEquipment(body),
      },
    };
  }

  @Patch(':equipmentId')
  async updateEquipment(
    @Param('equipmentId') equipmentId: string,
    @Body() body: UpdateEquipmentDto,
  ) {
    return {
      data: {
        equipment: await this.equipmentsService.updateEquipment(equipmentId, body),
      },
    };
  }
}
