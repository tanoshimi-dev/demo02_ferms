import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class ReservationAvailabilityQueryDto {
  @IsUUID()
  facilityId!: string;

  @IsOptional()
  @IsUUID()
  equipmentId?: string;

  @IsDateString()
  startAt!: string;

  @IsDateString()
  endAt!: string;
}

export class CreateReservationDto extends ReservationAvailabilityQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
