import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { WishList } from './wish-list.entity';
import { Detective } from './detective.entity';
import { Consultation } from './consultation.entity';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nickname: string;

  @Column({ type: 'bigint', nullable: false })
  phoneNumber: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index('user_email_index')
  @OneToMany(() => Detective, (detective) => detective.user)
  detective: Detective[];

  @OneToMany(() => WishList, (wishList) => wishList.consumer)
  wishList: WishList[];

  // @OneToMany(() => ChatRoom, (chatRoom) => chatRoom.sender)
  // sentChatRoom: ChatRoom[];

  // @OneToMany(() => ChatRoom, (chatRoom) => chatRoom.receiver)
  // receivedChatRoom: ChatRoom[];

  // @OneToMany(() => Review, (review) => review.consumer)
  // review: Review[];

  @OneToMany(() => Consultation, (consultation) => consultation.consumer)
  consultation: Consultation[];
}
