import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DetectiveRegion } from '../../detective/entities/detectiveRegion.entity';

@Entity({ name: 'region' })
export class Region {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @OneToMany(() => DetectiveRegion, (detectiveRegions) => detectiveRegions.region)
  detectiveRegions: DetectiveRegion[];
}
