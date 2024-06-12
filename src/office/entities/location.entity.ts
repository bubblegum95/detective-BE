import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DetectiveOffice } from './detective-office.entity';

@Entity({ name: 'location' })
export class Location {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'double precision', nullable: false })
  longitude: number;

  @Column({ type: 'double precision', nullable: false })
  latitude: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  address: string;

  @OneToMany(() => DetectiveOffice, (detectiveOffice) => detectiveOffice.location)
  detectiveOffice: DetectiveOffice[];
}
