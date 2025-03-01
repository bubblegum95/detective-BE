import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Office } from '../../office/entities/office.entity';
import { Detective } from '../../detective/entities/detective.entity';
import { Room } from '../../chat/entities/room.entity';

@Entity({ name: 'file' })
export class File {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  path: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Detective, (detective) => detective.profile)
  @JoinColumn({ name: 'detective_id' })
  detective: Detective;

  @OneToOne(() => Office, (office) => office.businessFile)
  @JoinColumn({ name: 'office_id' })
  office: Office;

  @OneToOne(() => User, (user) => user.file)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Room, (room) => room.files)
  room: Room;
}
