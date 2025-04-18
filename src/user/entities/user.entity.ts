import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { WishList } from '../../wishlist/entities/wish-list.entity';
import { Consultation } from '../../consultation/entities/consultation.entity';
import { Review } from '../../review/entities/review.entity';
import { File } from '../../s3/entities/s3.entity';
import { Office } from '../../office/entities/office.entity';
import { Detective } from '../../detective/entities/detective.entity';
import { Role } from '../../role/entities/role.entity';
import { Participant } from '../../chat/entities/participant.entity';
import { Notice } from '../../chat/entities/notice.entity';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 15, nullable: false })
  name: string;

  @Index('user_email_index')
  @Column({ type: 'varchar', length: 40, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 12, nullable: false })
  nickname: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: false, select: false })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToOne(() => Detective, (detective) => detective.user)
  detective: Detective;

  @OneToOne(() => File, (file) => file.user)
  @JoinColumn({ name: 'file_id' })
  file: File;

  @OneToMany(() => WishList, (wishList) => wishList.consumer)
  wishList: WishList[];

  @OneToMany(() => Participant, (participant) => participant.user)
  participants: Participant[];

  @OneToMany(() => Review, (review) => review.consumer)
  review: Review[];

  @OneToMany(() => Consultation, (consultation) => consultation.consumer)
  consultation: Consultation[];

  @OneToMany(() => Notice, (notice) => notice.receiver)
  notices: Notice[];

  @OneToOne(() => Office, (office) => office.owner)
  office: Office;
}
