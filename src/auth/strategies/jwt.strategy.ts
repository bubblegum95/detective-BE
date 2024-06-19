import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  // 토큰 유효성 검사
  async validate(payload: any) {
    const user = await this.authService.existedUserId(payload.id);
    if (!user) {
      throw new UnauthorizedException('일치하는 회원정보가 없습니다.');
    }
    return user; // 리턴된 유저 정보는 Request 객체에 user 필드로 추가됩니다.
  }
}
