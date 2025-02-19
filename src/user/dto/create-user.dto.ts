import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: '이름을 입력해주세요' })
  @ApiProperty({
    example: '남도일',
    description: '이름',
  })
  name: string;

  @IsEmail({}, { message: '이메일 형식에 맞지 않습니다.' })
  @IsNotEmpty({ message: '이메일을 입력해주세요' })
  @ApiProperty({
    example: 'example@email.com',
    description: '이메일',
  })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '닉네임을 입력해주세요' })
  @ApiProperty({
    example: '코난',
    description: '닉네임',
  })
  nickname: string;

  @IsString()
  @IsNotEmpty({ message: '휴대폰 번호를 입력해주세요' })
  @Matches(/^\d{11}$/, { message: '휴대폰 번호는 숫자 11자리여야 합니다.' })
  @ApiProperty({
    example: '01012345678',
    description: '휴대폰 번호',
  })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해주세요' })
  @ApiProperty({
    example: 'Example123!',
    description: '비밀번호',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '재확인 비밀번호를 입력해주세요' })
  @ApiProperty({
    example: 'Example123!',
    description: '비밀번호 재확인',
  })
  passwordConfirm: string;
}
