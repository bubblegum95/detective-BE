import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Participant } from './participant.entity';
import { File } from '../../s3/entities/s3.entity';

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

  @OneToMany(() => File, (file) => file.room)
  files: File[];
}
