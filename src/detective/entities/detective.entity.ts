import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Consultation } from '../../consultation/entities/consultation.entity';
import { Office } from '../../office/entities/office.entity';
import { User } from '../../user/entities/user.entity';
import { WishList } from '../../wishlist/entities/wish-list.entity';
import { License } from '../../license/entities/license.entity';
import { Career } from '../../career/entities/career.entity';
import { Review } from '../../review/entities/review.entity';
import { File } from '../../s3/entities/s3.entity';
import { Application } from '../../office/entities/application.entity';
import { Equipment } from '../../equipment/entities/equipment.entity';
import { Region } from '../../region/entities/region.entity';
import { Category } from '../../category/entities/category.entity';

@Entity({ name: 'detective' })
export class Detective {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', nullable: true })
  subject: string;

  @Column({ type: 'text', nullable: true })
  intro: string;

  @Column({ type: 'jsonb', nullable: true })
  equipments: Array<Equipment>;

  @Column({ type: 'jsonb', nullable: true })
  regions: Array<Region>;

  @Column({ type: 'jsonb', nullable: true })
  categories: Array<Category>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.detective)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Office, (office) => office.employees)
  @JoinColumn({ name: 'office_id' })
  office: Office;

  @OneToOne(() => File, (file) => file.detective)
  @JoinColumn({ name: 'profile_id' })
  profile: File;

  @OneToMany(() => License, (license) => license.detective)
  licenses: License[];

  @OneToMany(() => Career, (career) => career.detective)
  careers: Career[];

  @OneToMany(() => Review, (review) => review.detective)
  reviews: Review[];

  @OneToMany(() => Consultation, (consultation) => consultation.detective)
  consultations: Consultation[];

  @OneToMany(() => WishList, (wishList) => wishList.detective)
  wishList: WishList[];

  @OneToMany(() => Application, (applications) => applications.requester)
  applications: Application[];
}
