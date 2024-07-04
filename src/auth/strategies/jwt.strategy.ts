import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { Request } from 'express';
import * as cookie from 'cookie';

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

  private static extractJWT(req: Request | any): string | null {
    if (req.cookies) {
      // HTTP 요청의 경우
      const { authorization } = req.cookies;
      if (authorization) {
        const [tokenType, token] = authorization.split(' ');
        if (tokenType !== 'Bearer') throw new BadRequestException('토큰 타입이 일치하지 않습니다.');
        if (token) {
          return token;
        }
      }
    } else if (req.handshake && req.handshake.headers.cookie) {
      // WebSocket 요청의 경우
      const cookies = cookie.parse(req.handshake.headers.cookie || '');
      const authorization = cookies['authorization'];
      if (authorization) {
        const [tokenType, token] = authorization.split(' ');
        if (tokenType !== 'Bearer') throw new BadRequestException('토큰 타입이 일치하지 않습니다.');
        if (token) {
          console.log(token);
          return token;
        }
      }
    }
    return null;
  }

  async validate(payload: any) {
    try {
      const user = await this.userService.findUserbyId(payload.id);
      if (!user) {
        throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }
}
