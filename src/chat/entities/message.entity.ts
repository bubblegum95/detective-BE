import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const FileSchema = SchemaFactory.createForClass(File);

@Schema()
export class Message extends Document {
  @Prop({})
  content: string;

  @Prop({ required: true })
  sender: number;

  @Prop({ required: true })
  room: string;

  @Prop({ default: Date.now() })
  timestamp: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
