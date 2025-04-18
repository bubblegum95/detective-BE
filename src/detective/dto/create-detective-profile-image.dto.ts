import { ApiProperty } from '@nestjs/swagger';

export class CreateDetectiveProfileImageDto {
  @ApiProperty({ type: 'string', format: 'binary', description: '탐정 프로필 이미지 파일' })
  file: any;
}
