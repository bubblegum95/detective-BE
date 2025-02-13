import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WebSocketJwtMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(socket: Socket, next: (err?: Error) => void) {
    try {
      const token = socket.handshake.auth.authorization;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const payload = this.jwtService.verify(token);
      socket.handshake.auth = { user: payload };
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  }
}
