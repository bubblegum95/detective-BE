import { IsNumber, IsString } from 'class-validator';
export class ReadPostsDTO {
  @IsNumber()
  officeId: number;

  @IsNumber()
  regionId: number;

  @IsNumber()
  categoryId: number;

  @IsString()
  userName: string;
}
