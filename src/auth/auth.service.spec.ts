import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { DataSource } from 'typeorm';
import { S3Service } from '../s3/s3.service';
import { UserService } from '../user/user.service';
import { DetectiveOffice } from '../office/entities/detective-office.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';
import * as bcrypt from 'bcrypt';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { CreateConsumerAuthDto } from './dto/consumer-signup.dto';
import { CreateDetectiveEmployeeAuthDto } from './dto/detective-employee-signup.dto';
import { Gender } from './type/gender-enum.type';
import { Detective } from '../user/entities/detective.entity';
import { Position } from './type/position-enum.type';
import { Location } from '../office/entities/location.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let dataSource: DataSource;
  let s3Service: S3Service;
  let userService: UserService;

  const mockJwtSerivce = {
    sign: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      connect: jest.fn(),
      manager: {
        getRepository: jest.fn().mockReturnValue({
          save: jest.fn(),
        }),
      },
    }),
  };

  const mockS3Service = {
    uploadRegistrationFile: jest.fn().mockReturnValue({
      id: 1,
    }),
  };

  const mockUserService = {
    findUserbyEmail: jest.fn(),
    findUserbyId: jest.fn(),
    findUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtSerivce },
        { provide: DataSource, useValue: mockDataSource },
        { provide: S3Service, useValue: mockS3Service },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    dataSource = module.get<DataSource>(DataSource);
    s3Service = module.get<S3Service>(S3Service);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // existedEmail
  it('should find a user by email', async () => {
    const email: string = 'example2323@gmail.com';
    const foundUser = { id: 1, email: 'example2323@gmail.com' };

    mockUserService.findUserbyEmail.mockReturnValue(foundUser);
    const result = await authService.existedEmail(email);

    expect(result).toEqual(foundUser);
    expect(mockUserService.findUserbyEmail).toHaveBeenCalledWith(email);
  });

  // existedUserId success
  it('should find user by user id', async () => {
    const userId: number = 1;

    const foundUser = await mockUserService.findUserbyId(userId);
    const result = await authService.existedUserId(userId);

    expect(result).toEqual(foundUser);
    expect(mockUserService.findUserbyId).toHaveBeenCalledWith(userId);
  });

  // existedUserId reject
  it('should throw an error if findUserbyEmail fails', async () => {
    const userId: number = 1;
    const errorMessage = '일치하는 회원 정보가 없습니다.';

    mockUserService.findUserbyId.mockRejectedValue(new Error(errorMessage));

    await expect(authService.existedUserId(userId)).rejects.toThrow(errorMessage);
    expect(mockUserService.findUserbyId).toHaveBeenCalledWith(userId);
  });

  // validateUser success
  it('should return user if email and password are correct', async () => {
    const user = { id: 1, email: 'example@gmail.com', password: 'hashedPassword' } as User;
    const dto: SignInDto = { email: 'example@gmail.com', password: 'password' };

    mockUserService.findUser.mockResolvedValue(user);
    (bcrypt.compareSync as jest.Mock).mockReturnValue(true);

    const result = await authService.validateUser(dto);

    expect(result).toEqual(user);
    expect(mockUserService.findUser).toHaveBeenCalledWith(dto.email);
    expect(bcrypt.compareSync).toHaveBeenCalledWith(dto.password, user.password);
  });

  // validateUser reject
  it('should throw UnauthorizedException if user is not found', async () => {
    const dto: SignInDto = { email: 'example@gmail.com', password: 'password' };

    mockUserService.findUser.mockResolvedValue(null);

    await expect(authService.validateUser(dto)).rejects.toThrow(UnauthorizedException);
    expect(mockUserService.findUser).toHaveBeenCalledWith(dto.email);
    expect(bcrypt.compareSync).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if password does not match', async () => {
    const user = { id: 1, email: 'example@gmail.com', password: 'hashedPassword' };
    const dto: SignInDto = { email: 'example@gmail.com', password: 'wrongPassword' };

    mockUserService.findUser.mockResolvedValue(user);
    (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

    await expect(authService.validateUser(dto)).rejects.toThrow(BadRequestException);
    expect(mockUserService.findUser).toHaveBeenCalledWith(dto.email);
    expect(bcrypt.compareSync).toHaveBeenCalledWith(dto.password, user.password);
  });

  // createUserInfo
  it('should create user information', async () => {
    const name = '홍길동';
    const email = 'example1212@gmail.com';
    const nickname = '길동쓰';
    const phoneNumber = '01012345678';
    const password = 'example1234@';
    const hashedPassword = 'hashedPassword1234@';

    (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

    const user = {
      email: email,
      name: name,
      password: hashedPassword,
      nickname: nickname,
      phoneNumber: phoneNumber,
    };

    const queryRunner = mockDataSource.createQueryRunner();
    const saveMock = queryRunner.manager.getRepository(User).save;
    saveMock.mockResolvedValue(user);

    const result = await authService.createUserInfo(
      queryRunner,
      name,
      email,
      nickname,
      phoneNumber,
      password,
    );

    expect(result).toEqual(user);
    expect(queryRunner.manager.getRepository).toHaveBeenCalledWith(User);
    expect(saveMock).toHaveBeenCalledWith({
      email: email,
      name: name,
      password: hashedPassword,
      nickname: nickname,
      phoneNumber: phoneNumber,
    });
  });

  // createDetectiveInfo
  it('should create Detective employee information if positions is employee', async () => {
    const queryRunner = mockDataSource.createQueryRunner();
    const dto = {
      queryRunner,
      userId: 1,
      gender: Gender.Female,
      position: Position.Employee,
    };
    const detective = {
      id: 1,
    } as Detective;

    jest
      .spyOn(dto.queryRunner.manager.getRepository(Detective), 'save')
      .mockResolvedValue(detective);

    const result = await authService.createDetectiveInfo(dto);
    expect(result).toEqual(detective);
    expect(dto.queryRunner.manager.getRepository(Detective).save).toHaveBeenCalledWith({
      userId: dto.userId,
      gender: dto.gender,
      position: dto.position,
    });
  });

  it('should create Detective employer information if position is employer', async () => {
    const queryRunner = mockDataSource.createQueryRunner();
    const dto = {
      queryRunner,
      userId: 1,
      gender: Gender.Female,
      position: Position.Employer,
      officeId: 1,
      fileId: 1, // 이 부분을 일치시킴
    };
    const detective = {
      id: 1,
    } as Detective;

    // save 메서드 모킹
    jest
      .spyOn(dto.queryRunner.manager.getRepository(Detective), 'save')
      .mockResolvedValue(detective);

    const result = await authService.createDetectiveInfo(dto);
    expect(result).toEqual(detective);
    expect(dto.queryRunner.manager.getRepository(Detective).save).toHaveBeenCalledWith({
      userId: dto.userId,
      gender: dto.gender,
      position: dto.position,
      officeId: dto.officeId,
      business_registration_file_id: dto.fileId, // 이 부분을 일치시킴
    });
  });

  // createConsumer resolve
  it('should create consumer information successfully', async () => {
    const dto: CreateConsumerAuthDto = {
      email: 'example789@gmail.com',
      name: '홍길동',
      password: 'example1234@',
      passwordConfirm: 'example1234@',
      nickname: '길동쓰',
      phoneNumber: '01012345678',
    };

    const user: User = {
      id: 1,
      email: 'example789@gmail.com',
      name: '홍길동',
      password: 'hashedPassword1234@',
      nickname: '길동쓰',
      phoneNumber: '01012345678',
    } as User;

    jest.spyOn(authService, 'existedEmail').mockResolvedValue(null);
    jest.spyOn(authService, 'createUserInfo').mockResolvedValue(user);

    const result = await authService.createConsumer(dto);
    const queryRunner = mockDataSource.createQueryRunner();

    expect(result).toEqual(user);
    expect(mockDataSource.createQueryRunner).toHaveBeenCalled();
    expect(authService.existedEmail).toHaveBeenCalledWith(dto.email);
    expect(authService.createUserInfo).toHaveBeenCalledWith(
      queryRunner,
      dto.name,
      dto.email,
      dto.nickname,
      dto.phoneNumber,
      dto.password,
    );
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
  });

  it('should throw new Exception if password doesnt match password confirm', async () => {
    const dto: CreateConsumerAuthDto = {
      email: 'example678@gmail.com',
      name: '홍길동',
      password: 'example1234@',
      passwordConfirm: 'wrongPassword1234@',
      nickname: '길동쓰',
      phoneNumber: '01012345678',
    };

    expect(authService.createConsumer(dto)).rejects.toThrow(
      new ConflictException('비밀번호와 재입력된 비밀번호가 서로 일치하지 않습니다.'),
    );
  });

  it('should throw new Exception if email exist', async () => {
    const dto: CreateConsumerAuthDto = {
      email: 'example456@gmail.com',
      name: '홍길동',
      password: 'example1234@',
      passwordConfirm: 'example1234@',
      nickname: '길동쓰',
      phoneNumber: '01012345678',
    };

    const user: User = {
      id: 1,
      email: 'example456@gmail.com',
      name: '홍길동',
      password: 'hashedPassword1234@',
      nickname: '길동쓰',
      phoneNumber: '01012345678',
    } as User;

    const result = authService.createConsumer(dto);

    jest.spyOn(authService, 'existedEmail').mockResolvedValue(user);

    expect(result).rejects.toThrow(
      new ConflictException('해당 이메일로 가입된 사용자가 있습니다.'),
    );
  });

  it('should rollback transaction if new user wasnt created', async () => {
    const dto: CreateConsumerAuthDto = {
      email: 'example123123@gmail.com',
      name: '홍길동',
      password: 'example1234@',
      passwordConfirm: 'example1234@',
      nickname: '길동쓰',
      phoneNumber: '01012345678',
    };

    jest.spyOn(authService, 'existedEmail').mockResolvedValue(null);
    jest.spyOn(authService, 'createUserInfo').mockResolvedValue(null);

    const result = authService.createConsumer(dto);
    const queryRunner = mockDataSource.createQueryRunner();

    await expect(result).rejects.toThrow(
      new BadRequestException('사용자 정보 생성에 실패했습니다. 회원가입을 다시 진행해주세요.'),
    );
    expect(mockDataSource.createQueryRunner).toHaveBeenCalled();
    expect(authService.existedEmail).toHaveBeenCalledWith(dto.email);
    expect(authService.createUserInfo).toHaveBeenCalledWith(
      queryRunner,
      dto.name,
      dto.email,
      dto.nickname,
      dto.phoneNumber,
      dto.password,
    );

    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
  });

  // createDetectiveWithNoFile
  it('should create detective and commit transaction successfully', async () => {
    const dto: CreateDetectiveEmployeeAuthDto = {
      name: '홍길동',
      email: 'example@gmail.com',
      nickname: '길동쓰',
      phoneNumber: '01012345678',
      password: 'example1234@',
      passwordConfirm: 'example1234@',
      gender: Gender.Male,
    };

    const user: User = {
      id: 1,
      email: 'example@gmail.com',
      name: '홍길동',
      password: 'hashedPassword1234@',
      nickname: '길동쓰',
      phoneNumber: '01012345678',
    } as User;

    const detective = {
      id: 1,
    } as Detective;

    jest.spyOn(authService, 'existedEmail').mockResolvedValue(null);
    jest.spyOn(authService, 'createUserInfo').mockResolvedValue(user);
    jest.spyOn(authService, 'createDetectiveInfo').mockResolvedValue(detective);

    const result = await authService.createDetectiveWithNoFile(dto);
    const queryRunner = mockDataSource.createQueryRunner();
    const detectiveDto = {
      queryRunner,
      userId: user.id,
      gender: dto.gender,
      position: Position.Employee,
    };

    expect(result).toEqual(user);
    expect(mockDataSource.createQueryRunner).toHaveBeenCalled();
    expect(authService.existedEmail).toHaveBeenCalledWith(dto.email);
    expect(authService.createUserInfo).toHaveBeenCalledWith(
      queryRunner,
      dto.name,
      dto.email,
      dto.nickname,
      dto.phoneNumber,
      dto.password,
    );
    expect(authService.createDetectiveInfo).toHaveBeenCalledWith(detectiveDto);
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
  });

  it('should throw ConflictException if passwords do not match', async () => {
    const dto: CreateDetectiveEmployeeAuthDto = {
      name: '홍길동',
      email: 'example@gmail.com',
      nickname: '길동쓰',
      phoneNumber: '01012345678',
      password: 'example1234@',
      passwordConfirm: 'differentPassword1234@',
      gender: Gender.Male,
    };

    const result = authService.createDetectiveWithNoFile(dto);

    await expect(result).rejects.toThrow(
      new ConflictException('비밀번호와 재입력된 비밀번호가 서로 일치하지 않습니다.'),
    );

    const queryRunner = mockDataSource.createQueryRunner();
  });

  it('should throw ConflictException if email already exists', async () => {
    const dto: CreateDetectiveEmployeeAuthDto = {
      name: '홍길동',
      email: 'example@gmail.com',
      nickname: '길동쓰',
      phoneNumber: '01012345678',
      password: 'example1234@',
      passwordConfirm: 'example1234@',
      gender: Gender.Male,
    };

    const user: User = {
      id: 1,
      email: 'example@gmail.com',
      name: '홍길동',
      password: 'hashedPassword1234@',
      nickname: '길동쓰',
      phoneNumber: '01012345678',
    } as User;

    jest.spyOn(authService, 'existedEmail').mockResolvedValue(user);

    await expect(authService.createDetectiveWithNoFile(dto)).rejects.toThrow(
      new ConflictException('해당 이메일로 가입된 사용자가 있습니다.'),
    );

    const queryRunner = mockDataSource.createQueryRunner();
  });

  it('should rollback transaction if user creation fails', async () => {
    const dto: CreateDetectiveEmployeeAuthDto = {
      name: '홍길동',
      email: 'example@gmail.com',
      nickname: '길동쓰',
      phoneNumber: '01012345678',
      password: 'example1234@',
      passwordConfirm: 'example1234@',
      gender: Gender.Male,
    };

    jest.spyOn(authService, 'existedEmail').mockResolvedValue(null);
    jest.spyOn(authService, 'createUserInfo').mockResolvedValue(null);

    const result = authService.createDetectiveWithNoFile(dto);

    await expect(result).rejects.toThrow(
      new BadRequestException('사용자 정보 생성에 실패했습니다. 회원가입을 다시 진행해주세요.'),
    );

    const queryRunner = mockDataSource.createQueryRunner();
    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
  });

  it('should create Detective Owner information if position is employer', async () => {
    const dto = {
      name: '홍길동',
      email: 'example@gmail.com',
      nickname: '신출귀몰하회탈',
      phoneNumber: '01012345678',
      password: 'example1234@',
      passwordConfirm: 'example1234@',
      gender: Gender.Female,
      address: '동국별채',
      businessNumber: '1122334455',
      founded: '11112233',
      company: '동방후폭풍',
      file: '탐관오리아재들참교육.jpg',
    };

    const {
      name,
      email,
      nickname,
      phoneNumber,
      password,
      passwordConfirm,
      gender,
      address,
      businessNumber,
      founded,
      company,
    } = dto;

    const user: User = {
      id: 1,
      email: 'example@gmail.com',
      name: '홍길동',
      password: 'hashedPassword1234@',
      nickname: '신출귀몰하회탈',
      phoneNumber: '01012345678',
    } as User;

    const queryRunner = mockDataSource.createQueryRunner();

    const detective = {
      id: 1,
    } as Detective;

    const location = {
      id: 1,
    } as Location;

    const office = {
      id: 1,
    } as DetectiveOffice;

    const file = {
      fieldname: '탐관오리아재들참교육.jpg',
    } as Express.Multer.File;

    jest.spyOn(authService, 'existedEmail').mockResolvedValue(null);
    jest.spyOn(authService, 'createUserInfo').mockResolvedValue(user);
    jest.spyOn(authService, 'validationCheckBno').mockResolvedValue(true);
    jest.spyOn(authService, 'createBusinessAddress').mockResolvedValue(location);
    jest.spyOn(authService, 'createOfficeInfo').mockResolvedValue(office);
    jest.spyOn(mockS3Service, 'uploadRegistrationFile');

    const result = await authService.createDetective(dto, file);

    expect(result).toEqual(user);
    expect(mockDataSource.createQueryRunner).toHaveBeenCalled();
    expect(queryRunner.startTransaction).toHaveBeenCalled();
    expect(queryRunner.connect).toHaveBeenCalled();

    expect(queryRunner.commitTransaction).toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
  });

  it('should rollback transaction if business number validation check fails', async () => {
    const dto = {
      name: '홍길동',
      email: 'example@gmail.com',
      nickname: '신출귀몰하회탈',
      phoneNumber: '01012345678',
      password: 'example1234@',
      passwordConfirm: 'example1234@',
      gender: Gender.Female,
      address: '동국별채',
      businessNumber: '1122334455',
      founded: '11112233',
      company: '동방후폭풍',
      file: '탐관오리아재들참교육.jpg',
    };

    const {
      name,
      email,
      nickname,
      phoneNumber,
      password,
      passwordConfirm,
      gender,
      address,
      businessNumber,
      founded,
      company,
    } = dto;

    const user: User = {
      id: 1,
      email: 'example@gmail.com',
      name: '홍길동',
      password: 'hashedPassword1234@',
      nickname: '신출귀몰하회탈',
      phoneNumber: '01012345678',
    } as User;

    const queryRunner = mockDataSource.createQueryRunner();

    const file = {
      fieldname: '탐관오리아재들참교육.jpg',
    } as Express.Multer.File;

    jest.spyOn(authService, 'existedEmail').mockResolvedValue(null);
    jest.spyOn(authService, 'createUserInfo').mockResolvedValue(user);
    jest.spyOn(authService, 'validationCheckBno').mockResolvedValue(false);

    const result = authService.createDetective(dto, file);

    await expect(result).rejects.toThrow(
      new BadRequestException('사업자 정보를 확인할 수 없습니다. 입력하신 정보를 확인해주세요.'),
    );
    expect(authService.validationCheckBno).toHaveBeenCalledWith(
      dto.businessNumber,
      dto.founded,
      dto.name,
    );
    expect(mockDataSource.createQueryRunner).toHaveBeenCalled();
    expect(queryRunner.startTransaction).toHaveBeenCalled();
    expect(queryRunner.connect).toHaveBeenCalled();

    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
  });

  // signIn
  it('should sign in', async () => {
    const dto: SignInDto = {
      email: 'example@gmail.com',
      password: 'example1234@',
    };

    const user = {
      id: 1,
      email: 'example@gmail.com',
      password: 'hashedPassword',
    };

    const payload = {
      id: user.id,
    };

    const options = {
      secret: process.env.ACCESS_SECRET,
      expiresIn: '7d',
    };

    jest.spyOn(authService, 'validateUser').mockResolvedValue(user);

    const accessToken = mockJwtSerivce.sign(payload);
    const result = await authService.signIn(dto);

    expect(result).toEqual(accessToken);
    expect(authService.validateUser).toHaveBeenCalledWith(dto);
    expect(mockJwtSerivce.sign).toHaveBeenCalledWith(payload);
  });
});
