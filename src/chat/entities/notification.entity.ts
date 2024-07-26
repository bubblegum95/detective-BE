import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NotificationType } from '../type/notification.type';

export const FileSchema = SchemaFactory.createForClass(File);

@Schema()
export class Notification extends Document {
  @Prop({ required: true })
  type: NotificationType;

  @Prop({})
  receiver: number;

  @Prop({ required: true })
  sender: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now() })
  timestamp: string;

  @Prop({ required: true })
  read: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
