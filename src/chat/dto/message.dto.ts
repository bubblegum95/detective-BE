import { MessageType } from '../type/message.type';

export class MessageDto {
  sender: string;
  type: MessageType;
  content: string | string[];
  timestamp: string;
  room: string;
  read: number;
}
