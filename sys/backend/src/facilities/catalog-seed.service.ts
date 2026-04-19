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

    const catalog = [
      {
        name: 'Creative Studio A',
        description:
          '撮影・収録・配信のデモ確認に使いやすい、小規模スタジオです。',
        location: 'Tokyo / Floor 3',
        isActive: true,
        equipments: [
          {
            name: '4K Camera Set',
            description: '三脚・照明込みの撮影セットです。',
            isActive: true,
          },
          {
            name: 'Wireless Microphone',
            description: '収録用のワイヤレスマイクです。',
            isActive: true,
          },
        ],
      },
      {
        name: 'Meeting Room B',
        description:
          '打ち合わせ、ワークショップ、利用者予約フローのデモ向け会議室です。',
        location: 'Tokyo / Floor 5',
        isActive: true,
        equipments: [
          {
            name: 'Projector',
            description: '会議投影用プロジェクターです。',
            isActive: true,
          },
          {
            name: 'Conference Speaker',
            description: 'オンライン会議用のスピーカーフォンです。',
            isActive: true,
          },
        ],
      },
      {
        name: 'Event Hall C',
        description:
          'イベントや説明会の想定を含む、広めのデモ用ホールです。',
        location: 'Tokyo / Floor 8',
        isActive: true,
        equipments: [
          {
            name: 'Stage Lighting Kit',
            description: '簡易ステージ用の照明セットです。',
            isActive: true,
          },
          {
            name: 'Recording Mixer',
            description: '配信用の音声ミキサーです。',
            isActive: false,
          },
        ],
      },
      {
        name: 'Archive Room D',
        description:
          '停止中施設の挙動確認に使う、運用停止サンプルの保管室です。',
        location: 'Tokyo / Floor 1',
        isActive: false,
        equipments: [
          {
            name: 'Inventory Scanner',
            description: '棚卸し用のスキャナーです。',
            isActive: false,
          },
        ],
      },
    ];

    const facilities = await this.facilitiesRepository.save(
      catalog.map(({ name, description, location, isActive }) =>
        this.facilitiesRepository.create({
          name,
          description,
          location,
          isActive,
        }),
      ),
    );

    const equipments = catalog.flatMap((facility, index) =>
      facility.equipments.map((equipment) =>
        this.equipmentsRepository.create({
          facilityId: facilities[index].id,
          ...equipment,
        }),
      ),
    );

    await this.equipmentsRepository.save(equipments);

    this.logger.log(
      `Seeded demo catalog with ${facilities.length} facilities and ${equipments.length} equipments.`,
    );
  }
}
