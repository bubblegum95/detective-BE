import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Detective } from '../../detective/entities/detective.entity';
import { Category } from '../../category/entities/category.entity';

@Entity({ name: 'consultation' })
export class Consultation {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', name: 'title', nullable: false })
  title: string;

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

  @ManyToOne(() => Detective, (detective) => detective.consultations)
  @JoinColumn({ name: 'detective_id' })
  detective: Detective;

  @OneToOne(() => Category, (category) => category.consultation)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
