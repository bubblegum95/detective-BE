import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Participant } from '../../user/entities/participant.entity';

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
}
