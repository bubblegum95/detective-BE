import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Detective } from '../../detective/entities/detective.entity';

@Entity({ name: 'license' })
export class License {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 225, nullable: false })
  issuedAt: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  issuedBy: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @ManyToOne(() => Detective, (detective) => detective.licenses)
  @JoinColumn({ name: 'detective_id' })
  detective: Detective;
}
