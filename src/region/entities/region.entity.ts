import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RegionEnum } from '../type/region.type';
import { DetectiveRegion } from '../../detective/entities/detectiveRegion.entity';

@Entity({ name: 'region' })
export class Region {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'enum', enum: RegionEnum, nullable: false })
  name: RegionEnum;

  @OneToMany(() => DetectiveRegion, (detectiveRegions) => detectiveRegions.region)
  detectiveRegions: DetectiveRegion[];
}
