import { User } from '../../user/entities/user.entity';
import { Message } from '../entities/message.entity';

export class CreateNotificationDto {
  receiver: User['id'];
  sender: User['id'];
  content: Message['content'];
  room: Message['room'];
  isRead: boolean;
}
