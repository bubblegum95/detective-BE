import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FoundEmailDto {
  @IsString()
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  @ApiProperty({
    example: 'example@email.com',
    description: '이메일',
  })
  email: string;
}
