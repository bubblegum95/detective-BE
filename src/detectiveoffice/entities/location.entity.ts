import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DetectiveOffice } from './detective-office.entity';

@Entity({ name: 'location' })
export class Location {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'double precision', nullable: true })
  longitude: number;

  @Column({ type: 'double precision', nullable: true })
  latitude: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  address: string;

  @OneToMany(() => DetectiveOffice, (detectiveOffice) => detectiveOffice.location)
  detectiveOffice: DetectiveOffice[];
}
