import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Detective } from '../../user/entities/detective.entity';
import { User } from '../../user/entities/user.entity';

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

  @Column({ type: 'bigint', name: 'category_id', nullable: false })
  categoryId: number;

  @Column({ type: 'text', name: 'content', nullable: false })
  content: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'rejection', 'undergoing', 'completed'],
    nullable: false,
    default: 'pending',
  })
  status: 'pending' | 'rejection' | 'undergoing' | 'completed';

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.consultation)
  @JoinColumn({ name: 'consumer_id' })
  consumer: User;

  @ManyToOne(() => Detective, (detective) => detective.consultation)
  @JoinColumn({ name: 'detective_id' })
  detective: Detective;
}
