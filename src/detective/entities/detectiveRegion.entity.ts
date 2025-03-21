import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Region } from '../../region/entities/region.entity';
import { Detective } from './detective.entity';

@Entity({ name: 'detective_region' })
export class DetectiveRegion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Detective, (detective) => detective.detectiveRegions)
  @JoinColumn({ name: 'detective_id' })
  detective: Detective;

  @ManyToOne(() => Region, (region) => region.detectiveRegions)
  @JoinColumn({ name: 'region_id' })
  region: Region;
}
