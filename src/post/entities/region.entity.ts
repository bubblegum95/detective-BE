import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DetectivePost } from './detective-post.entity';

@Entity({ name: 'region' })
export class Region {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({
    type: 'enum',
    enum: [
      'seoul',
      'incheon',
      'daejeon',
      'sejong',
      'gwangju',
      'daegu',
      'ulsan',
      'busan',
      'gyeonggi',
      'gangwon',
      'chungbuk',
      'chungnam',
      'jeonbuk',
      'jeonnam',
      'gyeongbuk',
      'gyeongnam',
      'jeju',
    ],
    nullable: false,
  })
  name:
    | 'seoul'
    | 'incheon'
    | 'daejeon'
    | 'sejong'
    | 'gwangju'
    | 'daegu'
    | 'ulsan'
    | 'busan'
    | 'gyeonggi'
    | 'gangwon'
    | 'chungbuk'
    | 'chungnam'
    | 'jeonbuk'
    | 'jeonnam'
    | 'gyeongbuk'
    | 'gyeongnam'
    | 'jeju';

  @OneToMany(() => DetectivePost, (detectivePost) => detectivePost.region)
  detectivePost: DetectivePost[];
}
