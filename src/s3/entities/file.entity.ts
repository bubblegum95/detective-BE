import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Detective } from '../../user/entities/detective.entity';
import { DetectivePost } from '../../post/entities/detective-post.entity';

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

  @OneToMany(() => DetectivePost, (detectivePost) => detectivePost.profileFile)
  detectivePost: DetectivePost[];

  @OneToMany(() => Detective, (detective) => detective.businessRegistrationFile)
  detective: Detective[];
}
