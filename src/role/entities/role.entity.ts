import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { RoleType } from '../types/role.type';

@Entity({ name: 'role' })
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: RoleType, nullable: false, unique: true })
  name: string;

  @OneToOne(() => User, (user) => user.role)
  user: User;
}
