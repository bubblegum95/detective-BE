import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DetectiveOffice } from './detective-office.entity';

@Entity({ name: 'owner' })
export class Owner {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', name: 'detective_id', nullable: false })
  detectiveId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @ManyToOne(() => Detective, (detective: { owner: any }) => detective.owner)
  // @JoinColumn({ name: 'detective_id' })
  // detective: Detective;

  @OneToOne(() => DetectiveOffice, (detectiveOffice) => detectiveOffice.owner)
  @JoinColumn({ name: 'detectiveOffice_id' })
  detectiveOffice: DetectiveOffice;
}
