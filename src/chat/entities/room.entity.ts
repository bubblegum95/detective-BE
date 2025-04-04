import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Participant } from './participant.entity';
import { Message } from './message.entity';

@Entity({ name: 'room' })
export class Room {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @CreateDateColumn({ type: 'date', nullable: false })
  createdAt: Date;

  @OneToMany(() => Participant, (participant) => participant.room)
  participants: Participant[];

  @OneToMany(() => Message, (message) => message.room)
  messages: Message[];
}
