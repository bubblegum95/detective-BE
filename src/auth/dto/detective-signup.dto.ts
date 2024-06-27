import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { Gender } from '../type/gender-enum.type';

export class CreateDetectiveAuthDto {
  @IsString()
  @IsNotEmpty({ message: '이름을 입력해주세요' })
  @ApiProperty({
    example: '홍길동',
    description: '이름',
  })
  name: string;

  @IsEmail({}, { message: '이메일 형식에 맞지 않습니다.' })
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

  @IsString()
  @IsNotEmpty({ message: '휴대폰 번호를 입력해주세요' })
  @Matches(/^\d{10,11}$/, { message: '휴대폰 번호는 10자리 또는 11자리의 숫자여야 합니다.' })
  @ApiProperty({
    example: '01012345678',
    description: '휴대폰 번호',
  })
  phoneNumber: string;

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

  @IsString()
  @ApiProperty({
    example: '서울특별시 중구난방 뉘집이여 하온이네',
    description: '사업장 주소',
  })
  address: string;

  @IsString() // 10자리
  @ApiProperty({
    example: '0000000000',
    description: '사업자등록번호',
  })
  businessNumber: string;

  @IsString()
  @ApiProperty({
    example: 'YYYYMMDD',
    description: '설립일자',
  })
  founded: string;

  @IsString()
  @ApiProperty({
    example: '퐁식이네',
    description: '기업이름',
  })
  company: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
