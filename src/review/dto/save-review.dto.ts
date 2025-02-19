import { Detective } from '../../detective/entities/detective.entity';
import { User } from '../../user/entities/user.entity';

export class SaveReviewDto {
  comment: string;
  speed: number;
  accuracy: number;
  completion: number;
  consumer: User;
  detective: Detective;
}
