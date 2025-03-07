import { User } from '../../user/entities/user.entity';
import { Message } from '../entities/message.entity';
import { MessageType } from '../type/message.type';

export class RedisMessageDto {
  id: Message['_id'];
  sender: User['nickname'];
  type: MessageType;
  content: string | string[];
  timestamp: string;
  read: number; // room.participants.length - 1
}
