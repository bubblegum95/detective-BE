import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '수정할 닉네임',
    description: '수정할 닉네임',
    required: false,
  })
  nickname?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '현재 비밀번호',
    description: '현재 비밀번호',
    required: false,
  })
  password?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '변경할 비밀번호',
    description: '변경할 비밀번호',
    required: false,
  })
  newPassword?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: '프로필 파일 업로드',
    isArray: false,
    required: false,
  })
  @IsOptional()
  file?: any[];
}
