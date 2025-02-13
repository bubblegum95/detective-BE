import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Room } from '../../chat/entities/room.entity';

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
}
