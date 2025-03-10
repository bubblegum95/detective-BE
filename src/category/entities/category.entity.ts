import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Consultation } from '../../consultation/entities/consultation.entity';
import { CategoryEnum } from '../type/category.type';
import { DetectiveCategory } from '../../detective/entities/detectiveCategory.entity';

@Entity({ name: 'category' })
export class Category {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'enum', enum: CategoryEnum, nullable: false })
  name: CategoryEnum;

  @OneToMany(() => DetectiveCategory, (detectiveCategories) => detectiveCategories.category)
  detectiveCategories: DetectiveCategory[];

  @OneToMany(() => Consultation, (consultation) => consultation.categories)
  consultation: Consultation;
}
