import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EquipmentEnum } from '../type/equipment.type';
import { DetectiveEquipment } from '../../detective/entities/detectiveEquipment.entity';

@Entity({ name: 'equipment' })
export class Equipment {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'enum', enum: EquipmentEnum, nullable: false })
  name: EquipmentEnum;

  @OneToMany(() => DetectiveEquipment, (detectiveEquipments) => detectiveEquipments.equipment)
  detectiveEquipments: DetectiveEquipment[];
}
