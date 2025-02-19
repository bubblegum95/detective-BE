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
  ConflictException,
} from '@nestjs/common';
import { CreateEmployerDto } from './dto/create-employer.dto';
import { CreateConsumerDto } from './dto/create-consumer.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/sign-in.dto';
import { AuthService } from './auth.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { FoundEmailDto } from './dto/found-email.dto';
import { Response } from 'express';
import { multerOptions } from '../utils/multerStorage';

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
      const existEmail = await this.authService.findUserByEmail(dto.email);
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
  @ApiBody({ type: CreateConsumerDto })
  async consumerSignUp(@Body() dto: CreateConsumerDto, @Res() res: Response) {
    try {
      const userExistence = await this.authService.findUserByEmail(dto.email);
      if (userExistence) {
        throw new ConflictException('해당 이메일로 가입된 사용자가 있습니다.');
      }

      const consumer = await this.authService.createConsumer(dto);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: '회원가입이 완료되었습니다',
        data: consumer.email,
      });
    } catch (error) {
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        message: '회원가입을 완료할 수 없습니다.',
        error: error.message,
      });
    }
  }

  // detective/employee 회원가입
  @Post('signup/employee')
  @ApiOperation({ summary: '탐정 직원 회원가입', description: '탐정 직원 회원가입' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({ type: CreateEmployeeDto })
  async employeeSignUp(@Body() dto: CreateEmployeeDto) {
    try {
      const userExistence = await this.authService.findUserByEmail(dto.user.email);
      if (userExistence) {
        throw new BadRequestException('해당 이메일로 가입된 사용자가 있습니다.');
      }

      const employee = await this.authService.createEmployee(dto);
      return {
        success: true,
        message:
          '회원가입이 완료되었습니다. 활동 프로필 작성을 위한 탐정 직원등록을 신청하였습니다. 승인을 기다려주세요.',
        data: { email: employee.email },
      };
    } catch (error) {
      console.error(error.message);
      return {
        success: false,
        message: '회원가입을 완료할 수 없습니다.',
        error: error.message,
      };
    }
  }

  // detective employer 회원가입
  @Post('signup/employer')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '탐정 업주 회원가입', description: '탐정 업주 회원가입' })
  @ApiBody({ type: CreateEmployerDto })
  async employerSignUp(@Body() dto: CreateEmployerDto, @UploadedFile() file: Express.Multer.File) {
    try {
      const userExistence = await this.authService.findUserByEmail(dto.user.email);
      if (userExistence) {
        throw new BadRequestException('해당 이메일로 가입된 사용자가 있습니다.');
      }
      if (!file) {
        throw new BadRequestException('사업자등록증 이미지 파일을 업로드해주세요.');
      }
      // 사업자 등록 정보 검증
      const validateBusiness = await this.authService.validationCheckBno(
        dto.office.businessNum,
        dto.office.founded,
        dto.office.name,
      );
      if (!validateBusiness) {
        throw new BadRequestException(
          '사업자 정보를 확인할 수 없습니다. 입력하신 정보를 확인해주세요.',
        );
      }

      const path = file.originalname;
      const owner = await this.authService.createEmployer(dto, path);
      return {
        success: true,
        message: '회원가입이 완료되었습니다',
        data: { email: owner.email },
      };
    } catch (error) {
      console.error(error.message);
      return {
        success: false,
        message: '회원가입할 수 없습니다.',
        error: error.message,
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
        message: '로그인을 진행할 수 없습니다.',
        error: error.message,
      });
    }
  }
}
