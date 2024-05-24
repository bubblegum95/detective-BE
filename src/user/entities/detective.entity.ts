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
import { WishList } from './wish-list.entity';
import { Gender } from '../../auth/type/gender-enum.type';
import { Position } from '../../auth/type/position-enum.type';
import { File } from '../../s3/entities/file.entity';
import { DetectiveOffice } from '../../detectiveoffice/entities/detective-office.entity';
import { Owner } from '../../detectiveoffice/entities/owner.entity';
import { Consultation } from '../../consultation/entities/consultation.entity';
import { DetectivePost } from '../../post/entities/detective-post.entity';
import { Career } from '../../post/entities/career.entity';

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

  @ManyToOne(() => User, (user) => user.detective)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => DetectiveOffice, (office) => office.detective)
  @JoinColumn({ name: 'office_id' })
  detectiveOffice: DetectiveOffice;

  @ManyToOne(() => File, (file) => file.detective)
  @JoinColumn({ name: 'business_registration_file_id' })
  businessRegistrationFile: File;

  @OneToMany(() => Career, (career) => career.detective)
  career: Career[];

  @OneToMany(() => DetectivePost, (detectivePost) => detectivePost.detective)
  detectivePost: DetectivePost[];

  @OneToMany(() => Owner, (owner) => owner.detective)
  owner: Owner[];

  @OneToMany(() => Consultation, (consultation) => consultation.detective)
  consultation: Consultation[];

  @OneToMany(() => WishList, (wishList) => wishList.detective)
  wishList: WishList[];
}
