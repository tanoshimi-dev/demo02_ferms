import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EquipmentEntity } from '../equipments/equipment.entity';
import { ReservationEntity } from '../reservations/reservation.entity';

@Entity({ name: 'facilities' })
export class FacilityEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 255 })
  location!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => EquipmentEntity, (equipment) => equipment.facility)
  equipments!: EquipmentEntity[];

  @OneToMany(() => ReservationEntity, (reservation) => reservation.facility)
  reservations!: ReservationEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
