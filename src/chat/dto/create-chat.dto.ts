import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateChatDto {
  @IsNumber()
  @IsNotEmpty()
  sender: number;

  @IsNumber()
  @IsNotEmpty()
  receiver: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
