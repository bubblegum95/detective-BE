import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Room } from '../../chat/entities/room.entity';

@Entity({ name: 'participant' })
export class Participant {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint', nullable: false })
  roomId: number;

  @Column({ type: 'bigint', nullable: false })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Room, (room) => room.participants)
  room: Room;

  @ManyToOne(() => User, (user) => user.participants)
  user: User;
}
