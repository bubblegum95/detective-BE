import { User } from '../../user/entities/user.entity';
import { Room } from '../entities/room.entity';

export class CreateNotificationDto {
  receiver: User['id'];
  sender: User['id'];
  room: Room['id'];
  isRead: boolean;
}
