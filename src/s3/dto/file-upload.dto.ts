import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FileUploadDto {
  @IsString()
  @ApiProperty({
    example: '채팅 룸 이름',
    description: '채팅 룸 이름',
  })
  room: string;

  @ApiProperty({ type: 'string', format: 'binary', description: '채팅 파일 업로드', isArray: true })
  files: any[];
}
