import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateConsultationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  subject: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  content: string;
}
