import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateDetectiveAuthDto } from './dto/create-detective-auth.dto';
import { CreateConsumerAuthDto } from './dto/create-consumer-auth.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Position } from './type/position-enum.type';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { S3Service } from '../s3/s3.service';

@UsePipes(new ValidationPipe({ transform: true }))
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly s3Service: S3Service,
  ) {}

  // consumer 회원가입
  @Post('signup/consumer')
  @ApiBody({
    description: 'Create Detective',
    type: CreateConsumerAuthDto,
  })
  async consumerSignUp(@Body() createConsumerAuthDto: CreateConsumerAuthDto) {
    this.authService.createConsumer(createConsumerAuthDto);
    return {
      success: true,
      data: { message: '회원가입이 완료되었습니다' },
    };
  }

  // detective 회원가입
  // @Post('signup/detective')
  // @UseInterceptors(FileInterceptor('file'))
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   description: 'Create Detective',
  //   type: CreateDetectiveAuthDto,
  // })
  // async detectiveSignUp(
  //   @Body() createDetectiveAuthDto: CreateDetectiveAuthDto,
  //   @UploadedFile() file: Express.Multer.File,
  // ) {
  //   if (createDetectiveAuthDto.position === Position.Employer && !file) {
  //     throw new BadRequestException('파일을 업로드해주세요');
  //   }

  //   if (createDetectiveAuthDto.position === Position.Employee && file) {
  //     throw new BadRequestException('파일 업로드는 업주만 가능합니다');
  //   }

  //   if (createDetectiveAuthDto.position === Position.Employer && !createDetectiveAuthDto.address) {
  //     throw new BadRequestException('회사 주소를 입력해주세요');
  //   }

  //   if (createDetectiveAuthDto.position === Position.Employee && createDetectiveAuthDto.address) {
  //     throw new BadRequestException('주소 입력은 업주만 가능합니다');
  //   }
  //   let fileId: number;

  //   if (file) {
  //     fileId = await this.s3Service.uploadRegistrationFile(file);
  //   }

  //   this.authService.createDetective(createDetectiveAuthDto, fileId);

  //   return {
  //     success: true,
  //     data: { message: '회원가입이 완료되었습니다' },
  //   };
  // }
}
