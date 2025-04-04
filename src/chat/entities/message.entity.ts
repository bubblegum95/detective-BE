import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MessageType } from '../type/message.type';
import { Participant } from './participant.entity';
import { Room } from './room.entity';
import { Notice } from './notice.entity';

@Entity({ name: 'message' })
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 225, nullable: false })
  content: string;

  @Column({ type: 'enum', enum: MessageType, nullable: false })
  type: MessageType;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'simple-array', nullable: true })
  notRead: Array<Participant['id']>;

  @JoinColumn({ name: 'sender_id' })
  @ManyToOne(() => Participant, (participant) => participant.messages)
  sender: Participant;

  @JoinColumn({ name: 'room_id' })
  @ManyToOne(() => Room, (room) => room.messages)
  room: Room;

  @OneToMany(() => Notice, (notice) => notice.message)
  notices: Notice[];
}
