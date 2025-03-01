import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { MessageType } from '../type/message.type';
import { Room } from './room.entity';
import { User } from '../../user/entities/user.entity';

@Schema()
export class Message extends Document {
  @Prop({ required: true, enum: MessageType })
  type: MessageType;

  @Prop({ required: true, type: SchemaTypes.Mixed })
  content: string | string[];

  @Prop({ required: true })
  sender: number;

  @Prop({ required: true })
  room: number;

  @Prop({ required: true })
  read: number[];

  @Prop({ default: Date.now() })
  timestamp: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
