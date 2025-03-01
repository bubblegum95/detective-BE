import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Notification extends Document {
  @Prop({ required: true })
  receiver: number[];

  @Prop({ required: true })
  sender: number;

  @Prop({ required: false })
  room: number;

  @Prop({ default: Date.now() })
  timestamp: string;

  @Prop({ required: true, default: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
