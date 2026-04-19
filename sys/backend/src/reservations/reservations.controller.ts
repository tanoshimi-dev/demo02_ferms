import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SessionAuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';
import {
  CreateReservationDto,
  ReservationAvailabilityQueryDto,
} from './reservation.dto';
import { ReservationsService } from './reservations.service';

@UseGuards(SessionAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get('availability')
  async getAvailability(@Query() query: ReservationAvailabilityQueryDto) {
    return {
      data: await this.reservationsService.checkAvailability(
        query.facilityId,
        new Date(query.startAt),
        new Date(query.endAt),
      ),
    };
  }

  @Get()
  async listReservations(@Req() request: AuthenticatedRequest) {
    return {
      data: {
        items: await this.reservationsService.listReservationsForUser(
          request.currentUser!.id,
        ),
      },
    };
  }

  @Get(':reservationId')
  async getReservation(
    @Req() request: AuthenticatedRequest,
    @Param('reservationId') reservationId: string,
  ) {
    return {
      data: {
        reservation: await this.reservationsService.getReservationForUserOrFail(
          reservationId,
          request.currentUser!.id,
        ),
      },
    };
  }

  @Post()
  async createReservation(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateReservationDto,
  ) {
    return {
      data: {
        reservation: await this.reservationsService.createReservation({
          user: request.currentUser!,
          facilityId: body.facilityId,
          equipmentId: body.equipmentId,
          startAt: new Date(body.startAt),
          endAt: new Date(body.endAt),
          note: body.note,
        }),
      },
    };
  }

  @Patch(':reservationId/cancel')
  async cancelReservation(
    @Req() request: AuthenticatedRequest,
    @Param('reservationId') reservationId: string,
  ) {
    return {
      data: {
        reservation: await this.reservationsService.cancelReservation(
          reservationId,
          request.currentUser!.id,
        ),
      },
    };
  }
}
