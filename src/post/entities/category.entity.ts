import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DetectivePost } from './detective-post.entity';

@Entity({ name: 'category' })
export class Category {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({
    type: 'enum',
    enum: [
      'family_law',
      'civil_law',
      'criminal_law',
      'corporate',
      'financial',
      'estate',
      'medical_accident',
      'insurance',
      'administrative_processing',
      'security_protection',
      'missing',
      'pet',
      'Illegal_device_detection',
      'digital_investigation',
      'international_investigation',
      'female_detective',
    ],
    nullable: true,
    comment:
      '가사, 민사, 형사, 기업, 금융, 부동산, 의료, 보험, 행정, 경호-보호, 행방불명, 반려동물, 불법기기탐지, 디지털조사,해외조사,여성탐정',
  })
  name:
    | 'family_law'
    | 'civil_law'
    | 'criminal_law'
    | 'corporate'
    | 'financial'
    | 'estate'
    | 'medical_accident'
    | 'insurance'
    | 'administrative_processing'
    | 'security_protection'
    | 'missing'
    | 'pet'
    | 'Illegal_device_detection'
    | 'digital_investigation'
    | 'international_investigation'
    | 'female_detective';

  @OneToMany(() => DetectivePost, (detectivePost) => detectivePost.category)
  detectivePost: DetectivePost[];
}
