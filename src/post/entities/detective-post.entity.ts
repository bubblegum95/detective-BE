import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Region } from './region.entity';
import { Equipment } from './equipment.entity';
import { License } from './license.entity';
import { Category } from './category.entity';
import { Career } from './career.entity';
import { Detective } from '../../user/entities/detective.entity';
import { Review } from '../../review/entities/review.entity';
import { File } from '../../s3/entities/s3.entity';
import { DetectiveOffice } from '../../office/entities/detective-office.entity';

@Entity({ name: 'detective_post' })
export class DetectivePost {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'bigint', name: 'profile_file_id', nullable: true })
  profileFileId: number;

  @Index('detective_post_detective_id_index')
  @Column({ type: 'bigint', name: 'detective_id', nullable: false })
  detectiveId: number;

  @Column({ type: 'bigint', name: 'career_id', nullable: true })
  careerId: number;

  @Column({ type: 'bigint', name: 'license_id', nullable: true })
  licenseId: number;

  @Column({ type: 'bigint', name: 'region_id', nullable: false })
  regionId: number;

  @Column({ type: 'bigint', name: 'category_id', nullable: false })
  categoryId: number;

  @Column({ type: 'bigint', name: 'equipment_id', nullable: false })
  equipmentId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Detective, (detective) => detective.detectivePost)
  @JoinColumn({ name: 'detective_id' })
  detective: Detective;

  @ManyToOne(() => Category, (category) => category.detectivePost)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => License, (license) => license.detectivePost)
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

  @OneToMany(() => Review, (review) => review.detectivePost)
  review: Review[];

  @ManyToOne(() => File, (file) => file.detectivePost)
  @JoinColumn({ name: 'profile_file_id' })
  profileFile: File;
}
