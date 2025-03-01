import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ConsultationStatus } from '../types/status.type';

export class DetectiveConsultationsQueryDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 1, description: '조회할 페이지' })
  page: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 10, description: '조회할 아이템 수' })
  limit: number;

  @IsEnum(ConsultationStatus)
  @IsOptional()
  @ApiProperty({
    description: '상담 진행상태',
    example: ConsultationStatus.PENDING,
    nullable: true,
  })
  status?: ConsultationStatus;
}
