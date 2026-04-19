import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { EquipmentEntity } from '../equipments/equipment.entity';
import { FacilityEntity } from '../facilities/facility.entity';
import { AdminReservationsController } from './admin-reservations.controller';
import { ReservationEntity } from './reservation.entity';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      ReservationEntity,
      FacilityEntity,
      EquipmentEntity,
    ]),
  ],
  controllers: [ReservationsController, AdminReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
