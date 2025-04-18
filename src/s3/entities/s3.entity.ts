import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Office } from '../../office/entities/office.entity';
import { Detective } from '../../detective/entities/detective.entity';

@Entity({ name: 'file' })
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  path: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Detective, (detective) => detective.profile)
  detective: Detective;

  @OneToOne(() => Office, (office) => office.businessFile)
  office: Office;

  @OneToOne(() => User, (user) => user.file)
  user: User;
}
