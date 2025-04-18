import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DetectiveEquipment } from '../../detective/entities/detectiveEquipment.entity';

@Entity({ name: 'equipment' })
export class Equipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @OneToMany(() => DetectiveEquipment, (detectiveEquipments) => detectiveEquipments.equipment)
  detectiveEquipments: DetectiveEquipment[];
}
