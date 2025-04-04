import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from './message.entity';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'notice' })
export class Notice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean', default: false, nullable: false })
  read: boolean;

  @JoinColumn({ name: 'notice_id' })
  @ManyToOne(() => Message, (message) => message.notices)
  message: Message;

  @JoinColumn({ name: 'receiver_id' })
  @ManyToOne(() => User, (user) => user.notices)
  receiver: User;
}
