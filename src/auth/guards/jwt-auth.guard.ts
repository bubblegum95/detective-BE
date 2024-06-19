import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() === 'http') {
      return this.validateHttpRequest(context);
    }

    if (context.getType() === 'ws') {
      return this.validateWsRequest(context);
    }

    return false;
  }

  private async validateHttpRequest(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('로그인 정보가 없습니다.');
    }

    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      const user = await this.authService.existedUserId(decoded.userId);

      if (!user) {
        throw new UnauthorizedException('회원정보가 존재하지 않습니다.');
      }

      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('인증 오류가 발생했습니다.');
    }
  }

  private async validateWsRequest(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = client.handshake.query.token;

    if (!token) {
      throw new UnauthorizedException('로그인 정보가 없습니다.');
    }

    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      const user = await this.authService.existedUserId(decoded.userId);

      if (!user) {
        throw new UnauthorizedException('회원정보가 존재하지 않습니다.');
      }

      client.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('인증 오류가 발생했습니다.');
    }
  }
}
