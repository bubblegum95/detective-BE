import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  OneToOne,
  ManyToMany,
} from 'typeorm';
import { WishList } from './wish-list.entity';
import { Detective } from './detective.entity';
import { Consultation } from '../../consultation/entities/consultation.entity';
import { Review } from '../../review/entities/review.entity';
import { Room } from '../../chat/entities/room.entity';
import { Participant } from './participant.entity';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 15, nullable: false })
  name: string;

  @Index('user_email_index')
  @Column({ type: 'varchar', length: 40, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nickname: string;

  @Column({ type: 'varchar', nullable: false })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Detective, (detective) => detective.user)
  detective: Detective;

  @OneToMany(() => WishList, (wishList) => wishList.consumer)
  wishList: WishList[];

  @OneToMany(() => Participant, (participant) => participant.user)
  participants: Participant[];

  @OneToMany(() => Review, (review) => review.consumer)
  review: Review[];

  @OneToMany(() => Consultation, (consultation) => consultation.consumer)
  consultation: Consultation[];
}
