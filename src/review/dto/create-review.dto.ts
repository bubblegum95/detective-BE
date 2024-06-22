import { IsEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateReviewDTO {
  @IsString()
  @IsEmpty({ message: '댓글을 입력해주세요.' })
  comment: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  reliability: number;

  @IsNumber()
  @Min(0)
  @Max(5)
  speed: number;

  @IsNumber()
  @Min(0)
  @Max(5)
  accuracy: number;

  @IsNumber()
  @Min(0)
  @Max(5)
  completion: number;
}
