import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EquipmentEntity } from '../equipments/equipment.entity';
import { FacilityEntity } from '../facilities/facility.entity';
import { UserEntity } from '../users/user.entity';

export type ReservationStatus = 'reserved' | 'cancelled' | 'completed';

@Entity({ name: 'reservations' })
export class ReservationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 255 })
  userId!: string;

  @Column({ name: 'facility_id', type: 'uuid' })
  facilityId!: string;

  @Column({ name: 'equipment_id', type: 'uuid', nullable: true })
  equipmentId!: string | null;

  @Column({ name: 'start_at', type: 'timestamptz' })
  startAt!: Date;

  @Column({ name: 'end_at', type: 'timestamptz' })
  endAt!: Date;

  @Column({ type: 'varchar', length: 50, default: 'reserved' })
  status!: ReservationStatus;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @ManyToOne(() => UserEntity, (user) => user.reservations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user!: UserEntity;

  @ManyToOne(() => FacilityEntity, (facility) => facility.reservations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'facility_id' })
  facility!: FacilityEntity;

  @ManyToOne(() => EquipmentEntity, (equipment) => equipment.reservations, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'equipment_id' })
  equipment!: EquipmentEntity | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
