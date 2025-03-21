import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Equipment } from '../../equipment/entities/equipment.entity';
import { Detective } from './detective.entity';

@Entity({ name: 'detective_equipment' })
export class DetectiveEquipment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Detective, (detective) => detective.detectiveEquipments)
  @JoinColumn({ name: 'detective_id' })
  detective: Detective;

  @ManyToOne(() => Equipment, (equipment) => equipment.detectiveEquipments)
  @JoinColumn({ name: 'equipment_id' })
  equipment: Equipment;
}
