import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'chat' })
export class Chat {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', name: 'sender_id', nullable: false })
  senderId: number;

  @Column({ type: 'bigint', name: 'receiver_id', nullable: false })
  receiverId: number;

  @Column({ type: 'bigint', nullable: false })
  createdAt: number;

  @ManyToOne(() => User, (user) => user.sentChatRoom)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedChatRoom)
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;
}
