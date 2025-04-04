import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Room } from '../../chat/entities/room.entity';
import { User } from '../../user/entities/user.entity';
import { Message } from './message.entity';

@Entity({ name: 'participant' })
export class Participant {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Room, (room) => room.participants)
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @ManyToOne(() => User, (user) => user.participants)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];
}
