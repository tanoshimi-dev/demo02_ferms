import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../auth/admin.guard';
import {
  AdminReservationQueryDto,
  UpdateReservationStatusDto,
} from './admin-reservation.dto';
import { ReservationsService } from './reservations.service';

@UseGuards(AdminAuthGuard)
@Controller('admin/reservations')
export class AdminReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  async listReservations(@Query() query: AdminReservationQueryDto) {
    return {
      data: {
        items: await this.reservationsService.listAdminReservations(query),
      },
    };
  }

  @Get(':reservationId')
  async getReservation(@Param('reservationId') reservationId: string) {
    return {
      data: {
        reservation:
          await this.reservationsService.getAdminReservationOrFail(reservationId),
      },
    };
  }

  @Patch(':reservationId')
  async updateReservation(
    @Param('reservationId') reservationId: string,
    @Body() body: UpdateReservationStatusDto,
  ) {
    return {
      data: {
        reservation: await this.reservationsService.updateReservationStatus(
          reservationId,
          body,
        ),
      },
    };
  }
}
