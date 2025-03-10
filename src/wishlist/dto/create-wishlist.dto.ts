import { Detective } from '../../detective/entities/detective.entity';
import { User } from '../../user/entities/user.entity';

export class CreateWishlistDto {
  consumer: User;
  detective: Detective;
}
