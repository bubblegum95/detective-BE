import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJWT]),
      secretOrKey: configService.get<string>('ACCESS_SECRET'),
      ignoreExpiration: false,
    });
  }

  private static extractJWT(req) {
    const { authorization } = req.cookies;
    if (authorization) {
      const [tokenType, token] = authorization.split(' ');
      if (tokenType !== 'Bearer') throw new BadRequestException('토큰 타입이 일치하지 않습니다.');
      if (token) {
        console.log('s3', token);
        return token;
      }
    }
    return null;
  }

  async validate(payload: any) {
    try {
      const user = await this.userService.findUserbyId(payload.id);

      return user;
    } catch (error) {
      throw error;
    }
  }
}
