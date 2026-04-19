import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import type { ReservationStatus } from './reservation.entity';

export class AdminReservationQueryDto {
  @IsOptional()
  @IsUUID()
  facilityId?: string;

  @IsOptional()
  @IsUUID()
  equipmentId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsIn(['reserved', 'cancelled', 'completed'])
  status?: ReservationStatus;
}

export class UpdateReservationStatusDto {
  @IsIn(['reserved', 'cancelled', 'completed'])
  status!: ReservationStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
