import { User } from '../../user/entities/user.entity';
import { Message } from '../entities/message.entity';
import { Participant } from '../entities/participant.entity';
import { MessageType } from '../type/message.type';

export class SendMessageDto {
  id: Message['id'];
  sender: User['nickname'];
  senderId: Participant['id'];
  type: MessageType;
  content: Message['content'];
  timestamp: string;
  notRead: Message['notRead'];
}
