import { User } from '../../user/entities/user.entity';
import { Message } from '../entities/message.entity';
import { Participant } from '../entities/participant.entity';
import { MessageType } from '../type/message.type';

export class SendMessageDto {
  id: Message['id'];
  sender: { id: Participant['id']; user: Partial<User> };
  type: MessageType;
  content: Message['content'];
  timestamp: Date;
  notRead: Message['notRead'];
}
