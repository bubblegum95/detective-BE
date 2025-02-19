import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Detective } from '../../detective/entities/detective.entity';

@Entity({ name: 'review' })
export class Review {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'text', nullable: false })
  comment: string;

  @Column({ type: 'int', nullable: false, default: 5 })
  reliability: number;

  @Column({ type: 'int', nullable: false, default: 5 })
  speed: number;

  @Column({ type: 'int', nullable: false, default: 5 })
  accuracy: number;

  @Column({ type: 'int', nullable: false, default: 5 })
  completion: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.review)
  @JoinColumn({ name: 'consumer_id' })
  consumer: User;

  @ManyToOne(() => Detective, (detective) => detective.reviews)
  @JoinColumn({ name: 'detective_id' })
  detective: Detective;
}
