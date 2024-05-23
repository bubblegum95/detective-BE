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

  // @OneToMany(() => Career, (career) => career.detective)
  // career: Career[];

  // @OneToMany(() => DetectivePost, (detectivePost) => detectivePost.detective)
  // detectivePost: DetectivePost[];

  // @OneToMany(() => Owner, (owner) => owner.detective)
  // owner: Owner[];

  // @OneToMany(() => Consultation, (consultation) => consultation.detective)
  // consultation: Consultation[];

  @OneToMany(() => WishList, (wishList) => wishList.detective)
  wishList: WishList[];
}
