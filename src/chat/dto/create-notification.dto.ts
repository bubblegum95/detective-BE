import { User } from '../../user/entities/user.entity';
import { Message } from '../entities/message.entity';

export class CreateNotificationDto {
  read: boolean;
  receiver: User;
  message: Message;
}
