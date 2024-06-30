import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinTable,
  ManyToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'room' })
export class Room {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @CreateDateColumn({ type: 'date', nullable: false })
  createdAt: Date;

  @ManyToMany(() => User, (user) => user.room)
  @JoinTable({
    name: 'room_users', // 테이블 이름
    joinColumn: {
      name: 'room_id', // Room 엔티티의 컬럼 이름
      referencedColumnName: 'id', // User 엔티티의 실제 PK 컬럼 이름
    },
    inverseJoinColumn: {
      name: 'user_id', // User 엔티티의 컬럼 이름
      referencedColumnName: 'id', // Room 엔티티의 실제 PK 컬럼 이름
    },
  })
  user: User[];
}
