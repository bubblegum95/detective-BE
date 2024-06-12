import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Owner } from './owner.entity';
import { Location } from './location.entity';

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

  //   @OneToMany(() => Detective, (detective) => detective.detectiveOffice)
  //   detective: Detective[];

  @OneToOne(() => Owner, (owner) => owner.detectiveOffice)
  @JoinColumn({ name: 'owner_id' })
  owner: Owner;
}
