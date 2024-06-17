import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Detective } from '../../user/entities/detective.entity';

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

  @ManyToOne(() => Detective, (detective) => detective.owner)
  @JoinColumn({ name: 'detective_id' })
  detective: Detective;
}
