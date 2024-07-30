import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export const FileSchema = SchemaFactory.createForClass(File);

@Schema()
export class ChatFile extends Document {
  @Prop({ required: true })
  files: string[];

  @Prop({ required: true })
  sender: number;

  @Prop({ required: true })
  room: string;

  @Prop({ default: Date.now() })
  timestamp: string;
}

export const ChatFileSchema = SchemaFactory.createForClass(ChatFile);
