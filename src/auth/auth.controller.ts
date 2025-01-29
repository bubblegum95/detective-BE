import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { CreateDetectiveAuthDto } from './dto/detective-signup.dto';
import { CreateConsumerAuthDto } from './dto/consumer-signup.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/sign-in.dto';
import { AuthService } from './auth.service';
import { CreateDetectiveEmployeeAuthDto } from './dto/detective-employee-signup.dto';
import { FoundEmailDto } from './dto/found-email.dto';
import { Response } from 'express';

@ApiTags('Auth')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 이메일 검증
  @Post('found-email')
  @ApiOperation({ summary: '이메일 찾기', description: '이메일 찾기' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({ type: FoundEmailDto })
  async verifyEmail(@Body() dto: FoundEmailDto) {
    try {
      const existEmail = await this.authService.existedEmail(dto.email);

      if (existEmail) {
        return {
          success: true,
          existingEmail: true,
          email: existEmail,
          message: '해당 이메일이 존재합니다.',
        };
      } else {
        return {
          success: true,
          existingEmail: false,
          email: null,
          message: '해당 이메일이 존재하지 않습니다.',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '이메일을 조회할 수 없습니다.',
      };
    }
  }

  // consumer 회원가입
  @Post('signup/consumer')
  @ApiOperation({ summary: '의뢰인 회원가입', description: '의뢰인 회원가입' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({ type: CreateConsumerAuthDto })
  async consumerSignUp(@Body() createConsumerAuthDto: CreateConsumerAuthDto) {
    await this.authService.createConsumer(createConsumerAuthDto);
    return {
      success: true,
      message: '회원가입이 완료되었습니다',
    };
  }

  // detective/employee 회원가입
  @Post('signup/employee')
  @ApiOperation({ summary: '탐정 직원 회원가입', description: '탐정 직원 회원가입' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({ type: CreateDetectiveEmployeeAuthDto })
  async detectiveEmployeeSignUp(
    @Body() createDetectiveEmployeeAuthDto: CreateDetectiveEmployeeAuthDto,
  ) {
    try {
      const detective = await this.authService.createDetectiveWithNoFile(
        createDetectiveEmployeeAuthDto,
      );

      if (!detective) {
        throw new Error('계정을 생성할 수 없습니다');
      }

      return {
        success: true,
        message: '회원가입이 완료되었습니다',
      };
    } catch (error) {
      console.error(error.message);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // detective employer 회원가입
  @Post('signup/employer')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '탐정 업주 회원가입', description: '탐정 업주 회원가입' })
  @ApiBody({ type: CreateDetectiveAuthDto })
  async detectiveSignUp(
    @Body() createDetectiveAuthDto: CreateDetectiveAuthDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('파일을 업로드해주세요');
    }

    if (!createDetectiveAuthDto.address) {
      throw new BadRequestException('사업장 주소를 입력해주세요');
    }

    if (!createDetectiveAuthDto.businessNumber) {
      throw new BadRequestException('사업자등록번호를 입력해주세요.');
    }

    if (!createDetectiveAuthDto.founded) {
      throw new BadRequestException('설립일자를 입력해주세요.');
    }

    try {
      const detective = await this.authService.createDetective(createDetectiveAuthDto, file);
      console.log('detective', detective);

      return {
        success: true,
        message: '회원가입이 완료되었습니다',
      };
    } catch (error) {
      console.error(error.message);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // 로그인
  @Post('signin')
  @ApiOperation({ summary: '로그인', description: '로그인' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({ type: SignInDto })
  async signIn(@Res() res: Response, @Body() signInDto: SignInDto) {
    try {
      const token = await this.authService.signIn(signInDto);
      if (!token) {
        throw new Error('토큰을 발급할 수 없습니다.');
      }

      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: '로그인하였습니다.', token: token });
    } catch (error) {
      console.error(error.message);
      return res.json({
        success: false,
        message: error.message,
      });
    }
  }
}
