import { Detective } from 'src/user/entities/detective.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { DetectiveOffice } from './detective-office.entity';

@Entity({ name: 'office_relationship' })
export class OfficeRelationship {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', name: 'office_id', nullable: false })
  officeId: number;

  @Column({ type: 'bigint', name: 'employee_id', nullable: false })
  employeeId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => DetectiveOffice, (detectiveOffice) => detectiveOffice.officeRelationship)
  @JoinColumn({ name: 'office_id' })
  detectiveOffice: DetectiveOffice;

  @OneToOne(() => Detective, (detective) => detective.officeRelationship)
  @JoinColumn({ name: 'employee_id' })
  detective: Detective;
}
