import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Detective } from '../../detective/entities/detective.entity';
import { File } from '../../s3/entities/s3.entity';
import { Application } from './application.entity';

@Entity({ name: 'office' })
export class Office {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 25, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 25, nullable: false, unique: true })
  businessNum: string;

  @Column({ type: 'varchar', length: 25, nullable: false })
  founded: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  addressDetail: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => File, (file) => file.office)
  @JoinColumn({ name: 'business_file_id' })
  businessFile: File; // 사업자등록증

  @OneToOne(() => User, (user) => user.office)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => Detective, (detective) => detective.office)
  employees: Detective[];

  @OneToMany(() => Application, (applications) => applications.office)
  applications: Application[];
}
