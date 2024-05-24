import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DetectivePost } from './detective-post.entity';
import { CategoryEnum } from '../type/category.type';

@Entity({ name: 'category' })
export class Category {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'enum', enum: CategoryEnum, nullable: false })
  name: CategoryEnum;

  @OneToMany(() => DetectivePost, (detectivePost) => detectivePost.category)
  detectivePost: DetectivePost[];
}
