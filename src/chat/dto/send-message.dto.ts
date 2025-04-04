import { User } from '../../user/entities/user.entity';
import { Message } from '../entities/message.entity';
import { MessageType } from '../type/message.type';

export class SendMessageDto {
  id: Message['id'];
  sender: User['nickname'];
  type: MessageType;
  content: Message['content'];
  timestamp: string;
  notRead: Message['notRead'];
}
