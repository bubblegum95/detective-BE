import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';
import { WishList } from './wish-list.entity';
import { Gender } from '../../auth/type/gender-enum.type';
import { Position } from '../../auth/type/position-enum.type';
import { DetectiveOffice } from '../../office/entities/detective-office.entity';
import { Consultation } from '../../consultation/entities/consultation.entity';
import { Career } from '../../post/entities/career.entity';
import { DetectivePost } from '../../post/entities/detective-post.entity';
import { File } from '../../s3/entities/s3.entity';
import { OfficeRelationship } from '../../office/entities/office-relationship.entity';

@Entity({ name: 'detective' })
export class Detective {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', name: 'user_id', nullable: false })
  userId: number;

  @Column({ type: 'bigint', name: 'office_id', nullable: true })
  officeId: number;

  @Column({ type: 'enum', enum: Gender, default: 'male', nullable: false })
  gender: Gender;

  @Column({ type: 'enum', enum: Position, default: 'employee', nullable: false })
  position: Position;

  @Column({ type: 'bigint', name: 'business_registration_file_id', nullable: true })
  businessRegistrationFileId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.detective)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => DetectiveOffice, (office) => office.detective)
  @JoinColumn({ name: 'office_id' })
  detectiveOffice: DetectiveOffice;

  @ManyToOne(() => File, (file) => file.detective)
  @JoinColumn({ name: 'business_registration_file_id' })
  businessRegistrationFile: File;

  @OneToMany(() => Career, (career) => career.detective)
  career: Career[];

  @OneToOne(() => DetectivePost, (detectivePost) => detectivePost.detective)
  detectivePost: DetectivePost;

  @OneToMany(() => Consultation, (consultation) => consultation.detective)
  consultation: Consultation[];

  @OneToMany(() => WishList, (wishList) => wishList.detective)
  wishList: WishList[];

  @OneToOne(() => OfficeRelationship, (officeRelationship) => officeRelationship.detective)
  officeRelationship: OfficeRelationship;
}
