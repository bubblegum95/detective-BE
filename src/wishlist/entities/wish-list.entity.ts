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

@Entity({ name: 'wish_list' })
export class WishList {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Detective, (detective) => detective.wishList)
  @JoinColumn({ name: 'detective_id' })
  detective: Detective;

  @ManyToOne(() => User, (user) => user.wishList)
  @JoinColumn({ name: 'consumer_id' })
  consumer: User;
}
