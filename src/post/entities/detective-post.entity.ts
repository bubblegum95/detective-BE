import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Region } from './region.entity';
import { Equipment } from './equipment.entity';
import { License } from './license.entity';
import { Category } from './category.entity';
import { Career } from './career.entity';

@Entity({ name: 'detective_post' })
export class DetectivePost {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'bigint', name: 'profile_file_id', nullable: false })
  profileFileId: number;

  @Column({ type: 'bigint', name: 'detective_id', nullable: false })
  detectiveId: number;

  @Column({ type: 'bigint', name: 'career_id', nullable: false })
  careerId: number;

  @Column({ type: 'bigint', name: 'license_id', nullable: false })
  licenseId: number;

  @Column({ type: 'bigint', name: 'region_id', nullable: false })
  regionId: number;

  @Column({ type: 'bigint', name: 'category_id', nullable: false })
  categoryId: number;

  @Column({ type: 'bigint', name: 'equipment_id', nullable: false })
  equipmentId: number;

  @Column({ type: 'bigint', name: 'review_id', nullable: false })
  reviewId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //   @Index('detective_post_detective_id_index')
  //   @ManyToOne(() => Detective, detective => detective.detectivePost)
  //   @JoinColumn({ name: 'detective_id' })
  //   detective: Detective;

  @ManyToOne(() => Category, (category) => category.detectivePost)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => License, (license) => license.detectivePost)
  @JoinColumn({ name: 'license_id' })
  license: License;

  @ManyToOne(() => Equipment, (equipment) => equipment.detectivePost)
  @JoinColumn({ name: 'equipment_id' })
  equipment: Equipment;

  @ManyToOne(() => Career, (career) => career.detectivePost)
  @JoinColumn({ name: 'career_id' })
  career: Career;

  @ManyToOne(() => Region, (region) => region.detectivePost)
  @JoinColumn({ name: 'region_id' })
  region: Region;

  //   @ManyToOne(() => Review, review => review.detectivePost)
  //   @JoinColumn({ name: 'review_id' })
  //   review: Review;

  //   @ManyToOne(() => File, file => file.detectivePost)
  //   @JoinColumn({ name: 'profile_file_id' })
  //   profileFile: File;
}
