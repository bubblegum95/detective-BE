import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Detective } from '../../user/entities/detective.entity';
import { Location } from './location.entity';
import { Region } from './region.entity';

@Entity({ name: 'detective_office' })
export class DetectiveOffice {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', name: 'owner_id', nullable: false })
  ownerId: number;

  @Column({ type: 'bigint', name: 'region_id', nullable: false })
  regionId: number;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'bigint', nullable: false })
  businessRegistrationNum: number;

  @Column({ type: 'date', nullable: false })
  founded: Date;

  @Column({ type: 'bigint', name: 'location_id', nullable: false })
  locationId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index('detective_office_location_id_index')
  @ManyToOne(() => Location, (location) => location.detectiveOffice)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @OneToMany(() => Detective, (detective) => detective.detectiveOffice)
  detective: Detective[];

  @ManyToOne(() => Region, (region) => region.detectiveOffice)
  @JoinColumn({ name: 'region_id' })
  region: Region;
}
