import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { EquipmentEntity } from '../equipments/equipment.entity';
import { CatalogSeedService } from './catalog-seed.service';
import { FacilitiesController } from './facilities.controller';
import { FacilityEntity } from './facility.entity';
import { FacilitiesService } from './facilities.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FacilityEntity, EquipmentEntity]),
    AuthModule,
  ],
  controllers: [FacilitiesController],
  providers: [FacilitiesService, CatalogSeedService],
  exports: [FacilitiesService],
})
export class FacilitiesModule {}
