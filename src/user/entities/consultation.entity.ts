import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Status } from '../type/consultation-status.type';
import { User } from './user.entity';
import { Detective } from './detective.entity';

@Entity({ name: 'consultation' })
export class Consultation {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', name: 'consumer_id', nullable: false })
  consumerId: number;

  @Column({ type: 'bigint', name: 'detective_id', nullable: false })
  detectiveId: number;

  @Column({ type: 'varchar', name: 'title', nullable: false })
  title: string;

  @Column({ type: 'enum', name: 'category', nullable: false })
  category: Category;

  @Column({ type: 'text', name: 'content', nullable: false })
  content: string;

  @Column({ type: 'enum', name: 'content', nullable: false, default: 'pending' })
  status: Status;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.consultation)
  @JoinColumn({ name: 'consumer_id' })
  consumer: User;

  @ManyToOne(() => Detective, (detective) => detective.consultation)
  @JoinColumn({ name: 'detective_id' })
  detective: Detective;
}
