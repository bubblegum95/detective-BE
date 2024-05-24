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
import { Consultation } from '../../consultation/entities/consultation.entity';
import { Review } from '../../review/entities/review.entity';
import { ChatRoom } from '../../chat/entities/chat-room.entity';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Index('user_email_index')
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

  @OneToMany(() => Detective, (detective) => detective.user)
  detective: Detective[];

  @OneToMany(() => WishList, (wishList) => wishList.consumer)
  wishList: WishList[];

  @OneToMany(() => ChatRoom, (chatRoom) => chatRoom.sender)
  sentChatRoom: ChatRoom[];

  @OneToMany(() => ChatRoom, (chatRoom) => chatRoom.receiver)
  receivedChatRoom: ChatRoom[];

  @OneToMany(() => Review, (review) => review.consumer)
  review: Review[];

  @OneToMany(() => Consultation, (consultation) => consultation.consumer)
  consultation: Consultation[];
}
