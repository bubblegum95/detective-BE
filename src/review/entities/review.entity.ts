import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { DetectivePost } from '../../post/entities/detective-post.entity';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'review' })
export class Review {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', name: 'consumer_id', unsigned: true, nullable: false })
  consumerId: number;

  @Column({ type: 'text', nullable: false })
  comment: string;

  @Column({ type: 'text', nullable: false })
  reply: string;

  @Column({ type: 'int', nullable: false, default: 5 })
  reliability: number;

  @Column({ type: 'int', nullable: false, default: 5 })
  speed: number;

  @Column({ type: 'int', nullable: false, default: 5 })
  accuracy: number;

  @Column({ type: 'int', nullable: false, default: 5 })
  completion: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: false,
    comment: '쿠ㅓ리문 알아서 작성하셈~',
  })
  totalScore: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.review)
  @JoinColumn({ name: 'consumer_id' })
  consumer: User;

  @OneToMany(() => DetectivePost, (detectivePost) => detectivePost.review)
  detectivePost: DetectivePost[];
}
