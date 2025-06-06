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
import { ConsultationStatus } from '../types/status.type';

@Entity({ name: 'consultation' })
export class Consultation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'subject', nullable: false })
  subject: string;

  @Column({ type: 'text', name: 'content', nullable: false })
  content: string;

  @Column({
    type: 'enum',
    enum: ConsultationStatus,
    nullable: false,
    default: ConsultationStatus.PENDING,
  })
  status: ConsultationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.consultation)
  @JoinColumn({ name: 'consumer_id' })
  consumer: User;

  @ManyToOne(() => Detective, (detective) => detective.consultations)
  @JoinColumn({ name: 'detective_id' })
  detective: Detective;

  @ManyToOne(() => Category, (category) => category.consultations)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
