import { Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'room' })
export class Room {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', nullable: false })
  createdAt: number;

  @ManyToMany(() => User, (user) => user.room)
  @JoinTable()
  user: User[];
}
