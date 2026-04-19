import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipmentEntity } from '../equipments/equipment.entity';
import { FacilityEntity } from './facility.entity';

@Injectable()
export class CatalogSeedService implements OnModuleInit {
  private readonly logger = new Logger(CatalogSeedService.name);

  constructor(
    @InjectRepository(FacilityEntity)
    private readonly facilitiesRepository: Repository<FacilityEntity>,
    @InjectRepository(EquipmentEntity)
    private readonly equipmentsRepository: Repository<EquipmentEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.facilitiesRepository.count();
    if (count > 0) {
      return;
    }

    const facilities = await this.facilitiesRepository.save([
      this.facilitiesRepository.create({
        name: 'Creative Studio A',
        description: '撮影・収録向けの小規模スタジオです。',
        location: 'Tokyo / Floor 3',
        isActive: true,
      }),
      this.facilitiesRepository.create({
        name: 'Meeting Room B',
        description: '打ち合わせやワークショップ向けの会議室です。',
        location: 'Tokyo / Floor 5',
        isActive: true,
      }),
    ]);

    await this.equipmentsRepository.save([
      this.equipmentsRepository.create({
        facilityId: facilities[0].id,
        name: '4K Camera Set',
        description: '三脚・照明込みの撮影セットです。',
        isActive: true,
      }),
      this.equipmentsRepository.create({
        facilityId: facilities[0].id,
        name: 'Wireless Microphone',
        description: '収録用のワイヤレスマイクです。',
        isActive: true,
      }),
      this.equipmentsRepository.create({
        facilityId: facilities[1].id,
        name: 'Projector',
        description: '会議投影用プロジェクターです。',
        isActive: true,
      }),
      this.equipmentsRepository.create({
        facilityId: facilities[1].id,
        name: 'Conference Speaker',
        description: 'オンライン会議用のスピーカーフォンです。',
        isActive: true,
      }),
    ]);

    this.logger.log('Seeded default facilities and equipments.');
  }
}
