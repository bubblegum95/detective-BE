import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { Detective } from './detective.entity';

@Entity({ name: 'detective_category' })
export class DetectiveCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Detective, (detective) => detective.detectiveCategories)
  @JoinColumn({ name: 'detective_id' })
  detective: Detective;

  @ManyToOne(() => Category, (category) => category.detectiveCategories)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
