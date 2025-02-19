import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Detective } from '../../detective/entities/detective.entity';

@Entity({ name: 'career' })
export class Career {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', nullable: false })
  startDate: string;

  @Column({ type: 'varchar', nullable: false })
  endDate: string;

  @Column({ type: 'text', nullable: false })
  businessDetails: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  corporateName: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  position: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Detective, (detective) => detective.careers)
  @JoinColumn({ name: 'detective_id' })
  detective: Detective;
}
