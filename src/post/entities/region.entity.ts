import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DetectivePost } from './detective-post.entity';
import { RegionEnum } from '../type/region.type';

@Entity({ name: 'region' })
export class Region {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'enum', enum: RegionEnum, nullable: false })
  name: RegionEnum;
  @OneToMany(() => DetectivePost, (detectivePost) => detectivePost.region)
  detectivePost: DetectivePost[];
}
