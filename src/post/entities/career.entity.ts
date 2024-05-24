import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DetectivePost } from './detective-post.entity';
import { Detective } from 'src/user/entities/detective.entity';

@Entity({ name: 'career' })
export class Career {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', name: 'detective_id', nullable: false })
  detectiveId: number;

  @Column({ type: 'date', nullable: false })
  startDate: Date;

  @Column({ type: 'date', nullable: false })
  endDate: Date;

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

  @ManyToOne(() => Detective, (detective) => detective.career)
  @JoinColumn({ name: 'detective_id' })
  detective: Detective;

  @OneToMany(() => DetectivePost, (detectivePost) => detectivePost.career)
  detectivePost: DetectivePost[];
}
