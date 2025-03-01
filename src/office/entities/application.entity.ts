import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Office } from './office.entity';
import { Detective } from '../../detective/entities/detective.entity';

@Entity({ name: 'application' })
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, default: false, type: 'boolean' })
  clear: boolean;

  @Column({ nullable: true, type: 'boolean' }) // 승인/거부
  result?: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Detective, (detective) => detective.applications)
  @JoinColumn({ name: 'detective_id' })
  requester: Detective;

  @ManyToOne(() => Office, (office) => office.applications)
  @JoinColumn({ name: 'office_id' })
  office: Office;
}
