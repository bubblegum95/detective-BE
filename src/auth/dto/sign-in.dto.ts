import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsEmail()
  @IsNotEmpty({ message: '이메일을 입력해주세요' })
  @ApiProperty({
    example: 'example@gmail.com',
    description: '이메일',
  })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해주세요' })
  @ApiProperty({
    example: 'example1234@',
    description: '비밀번호',
  })
  password: string;
}
