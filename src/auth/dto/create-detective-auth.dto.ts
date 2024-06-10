import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Gender } from '../type/gender-enum.type';
import { Position } from '../type/position-enum.type';

export class CreateDetectiveAuthDto {
  @IsString()
  @IsNotEmpty({ message: '이름을 입력해주세요' })
  @ApiProperty({
    example: '홍길동',
    description: '이름',
  })
  name: string;

  @IsEmail()
  @IsNotEmpty({ message: '이메일을 입력해주세요' })
  @ApiProperty({
    example: 'example@gmail.com',
    description: '이메일',
  })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '닉네임을 입력해주세요' })
  @ApiProperty({
    example: '길동쓰',
    description: '닉네임',
  })
  nickname: string;

  @IsNumber()
  @IsNotEmpty({ message: '휴대폰 번호를 입력해주세요' })
  @ApiProperty({
    example: '01012345678',
    description: '휴대폰 번호',
  })
  phoneNumber: number;

  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해주세요' })
  @ApiProperty({
    example: 'example1234@',
    description: '비밀번호',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호를 다시 입력해주세요' })
  @ApiProperty({
    example: 'example1234@',
    description: '비밀번호 재확인',
  })
  passwordConfirm: string;

  @IsEnum(Gender)
  @IsNotEmpty({ message: '성별을 선택해주세요' })
  @ApiProperty({
    example: 'male',
    description: '성별',
  })
  gender: Gender;

  @IsEnum(Position)
  @IsNotEmpty({ message: '직책을 선택해주세요' })
  @ApiProperty({
    example: 'employer',
    description: '직책',
  })
  position: Position;

  @IsString()
  @IsNotEmpty({ message: '회사 주소를 입력해주세요' })
  @ApiProperty({
    example: '서울특별시 중구난방 뉘집이여 하온이네',
    description: '직책',
  })
  address: string;
}
