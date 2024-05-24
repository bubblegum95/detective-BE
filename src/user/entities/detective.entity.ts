import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Consultation } from './consultation.entity';
import { WishList } from './wish-list.entity';
import { Career } from 'src/post/entities/career.entity';
import { DetectivePost } from 'src/post/entities/detective-post.entity';

@Entity({ name: 'detective' })
export class Detective {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', name: 'user_id', nullable: false })
  userId: number;

  @Column({ type: 'bigint', name: 'office_id', nullable: true })
  officeId: number;

  @Column({ type: 'enum', enum: ['male', 'female'], default: 'male', nullable: false })
  gender: 'male' | 'female';

  @Column({ type: 'enum', enum: ['employer', 'employee'], default: 'employee', nullable: false })
  position: 'employer' | 'employee';

  @Column({ type: 'varchar', name: 'business_registration_file_id', length: 255, nullable: true })
  businessRegistrationFileId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.detective)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // @ManyToOne(() => DetectiveOffice, (office) => office.detective)
  // @JoinColumn({ name: 'office_id' })
  // detectiveOffice: DetectiveOffice;

  // @ManyToOne(() => File, (file) => file.detective)
  // @JoinColumn({ name: 'business_registration_file_id' })
  // businessRegistrationFile: File;

  @OneToMany(() => Career, (career) => career.detective)
  career: Career[];

  @OneToMany(() => DetectivePost, (detectivePost) => detectivePost.detective)
  detectivePost: DetectivePost[];

  // @OneToMany(() => Owner, (owner) => owner.detective)
  // owner: Owner[];

  @OneToMany(() => WishList, (wishList) => wishList.detective)
  wishList: WishList[];

  @OneToMany(() => Consultation, (consultation) => consultation.detective)
  consultation: Consultation[];
}
