import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  Response,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './AuthService';
import { CreateDetectiveAuthDto } from './dto/detective-signup.dto';
import { CreateConsumerAuthDto } from './dto/consumer-signup.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Position } from './type/position-enum.type';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { S3Service } from '../s3/s3.service';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
@ApiTags('Auth')
@ApiCookieAuth('JWT')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly s3Service: S3Service,
    private readonly jwtService: JwtService,
  ) {}

  // consumer 회원가입
  @Post('signup/consumer')
  @ApiOperation({ summary: '의뢰인 회원가입', description: '의뢰인 회원가입' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        nickname: { type: 'string' },
        phoneNumber: { type: 'string' },
        password: { type: 'string' },
        passwordConfirm: { type: 'string' },
      },
    },
  })
  async consumerSignUp(@Body() createConsumerAuthDto: CreateConsumerAuthDto) {
    await this.authService.createConsumer(createConsumerAuthDto);
    return {
      success: true,
      message: '회원가입이 완료되었습니다',
    };
  }

  // detective 회원가입
  @Post('signup/detective')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '탐정 회원가입', description: '탐정 회원가입' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        nickname: { type: 'string' },
        phoneNumber: { type: 'string' },
        gender: { type: 'string', enum: ['male', 'female'] },
        position: { type: 'string', enum: ['employer', 'employee'] },
        password: { type: 'string' },
        passwordConfirm: { type: 'string' },
        address: { type: 'string' },
        businessNumber: { type: 'string' },
        founded: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async detectiveSignUp(
    @Body() createDetectiveAuthDto: CreateDetectiveAuthDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (createDetectiveAuthDto.position === Position.Employer && !file) {
      throw new BadRequestException('파일을 업로드해주세요');
    }

    if (createDetectiveAuthDto.position === Position.Employee && file) {
      throw new BadRequestException('파일 업로드는 업주만 가능합니다');
    }

    if (createDetectiveAuthDto.position === Position.Employer && !createDetectiveAuthDto.address) {
      throw new BadRequestException('사업장 주소를 입력해주세요');
    }

    if (createDetectiveAuthDto.position === Position.Employee && createDetectiveAuthDto.address) {
      throw new BadRequestException('사업장 주소 입력은 업주만 가능합니다');
    }

    if (
      createDetectiveAuthDto.position === Position.Employer &&
      !createDetectiveAuthDto.businessNumber
    ) {
      throw new BadRequestException('사업자등록번호 입력은 업주만 가능합니다');
    }

    if (
      createDetectiveAuthDto.position === Position.Employee &&
      createDetectiveAuthDto.businessNumber
    ) {
      throw new BadRequestException('사업자등록번호 입력은 업주만 가능합니다');
    }

    if (createDetectiveAuthDto.position === Position.Employer && !createDetectiveAuthDto.founded) {
      throw new BadRequestException('설립일자 입력은 업주만 가능합니다');
    }

    if (createDetectiveAuthDto.position === Position.Employee && createDetectiveAuthDto.founded) {
      throw new BadRequestException('설립일자 입력은 업주만 가능합니다');
    }
    try {
      let fileId: number;

      if (file) {
        fileId = await this.s3Service.uploadRegistrationFile(file);
      }

      const detective = await this.authService.createDetective(createDetectiveAuthDto, fileId);
      console.log('detective', detective);

      if (!detective) {
        throw new Error('계정을 생성할 수 없습니다');
      }

      return {
        success: true,
        message: '회원가입이 완료되었습니다',
      };
    } catch (error) {
      // console.error(error.message);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // consumer 회원가입
  @Post('signin')
  @ApiOperation({ summary: '로그인', description: '로그인' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  async signIn(@Response() res, @Body() signInDto: SignInDto) {
    const token = this.authService.signIn(signInDto);

    return res
      .cookie('authorization', `Bearer ${token}`, {
        maxAge: '24h',
        httpOnly: true,
        secure: true,
      })
      .status(HttpStatus.OK)
      .json({ message: '성공적으로 로그인하였습니다.' });
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃', description: '로그아웃' })
  signOut(@Response() res) {
    res.clearCookie('authorization');
    res.send('로그아웃에 성공하였습니다.');
  }
}
