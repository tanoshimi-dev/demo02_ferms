import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { FacilityEntity } from '../facilities/facility.entity';
import { AdminEquipmentsController } from './admin-equipments.controller';
import { EquipmentEntity } from './equipment.entity';
import { EquipmentsController } from './equipments.controller';
import { EquipmentsService } from './equipments.service';

@Module({
  imports: [TypeOrmModule.forFeature([EquipmentEntity, FacilityEntity]), AuthModule],
  controllers: [EquipmentsController, AdminEquipmentsController],
  providers: [EquipmentsService],
  exports: [EquipmentsService],
})
export class EquipmentsModule {}
