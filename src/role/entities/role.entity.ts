import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { RoleType } from '../types/role.type';

@Entity({ name: 'role' })
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: RoleType, nullable: false })
  name: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
