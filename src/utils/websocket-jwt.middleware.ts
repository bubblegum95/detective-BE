import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import * as cookie from 'cookie';

@Injectable()
export class WebSocketJwtMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(socket: Socket, next: (err?: Error) => void) {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = cookies['authorization']; // 쿠키에서 JWT 토큰 추출

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const payload = this.jwtService.verify(token);
      socket.handshake.auth = { user: payload };
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  }
}
