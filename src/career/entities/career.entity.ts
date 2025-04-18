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
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  company: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  position: string;

  @Column({ type: 'varchar', nullable: false })
  job: string;

  @Column({ type: 'varchar', nullable: false })
  start: string;

  @Column({ type: 'varchar', nullable: false })
  end: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Detective, (detective) => detective.careers)
  @JoinColumn({ name: 'detective_id' })
  detective: Detective;
}
