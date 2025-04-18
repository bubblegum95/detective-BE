import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'news' })
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'rank', nullable: false })
  rank: number;

  @Column({ type: 'text', name: 'screen_shot', nullable: true })
  screenShot: string;

  @Column({ type: 'text', name: 'screen_shot_description', nullable: true })
  screenShotDescription: string;

  @Column({ type: 'text', name: 'content', nullable: false })
  content: string;
}
