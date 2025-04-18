import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Consultation } from '../../consultation/entities/consultation.entity';
import { DetectiveCategory } from '../../detective/entities/detectiveCategory.entity';

@Entity({ name: 'category' })
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @OneToMany(() => DetectiveCategory, (detectiveCategories) => detectiveCategories.category)
  detectiveCategories: DetectiveCategory[];

  @OneToMany(() => Consultation, (consultation) => consultation.category)
  consultations: Consultation[];
}
