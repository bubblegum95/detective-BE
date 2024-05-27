import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DetectivePost } from './detective-post.entity';

@Entity({ name: 'license' })
export class License {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'date', nullable: false })
  issuedAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: false })
  issuedBy: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @ManyToOne(() => DetectivePost, (detectivePost) => detectivePost.license)
  detectivePost: DetectivePost;
}
