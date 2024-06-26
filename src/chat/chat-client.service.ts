import { Injectable, OnModuleInit } from '@nestjs/common';
import { Socket, io } from 'socket.io-client';
import { UserService } from '../user/user.service';

@Injectable()
export class WebSocketClientService implements OnModuleInit {
  private socket: Socket;

  onModuleInit() {
    this.socket = io('http://localhost:3000', {
      withCredentials: true,
    });

    this.registerListeners();
  }

  private registerListeners() {
    this.socket.on('connect', () => {
      console.log(`Connected to server with id: ${this.socket.id}`);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('message', (data: any) => {
      console.log('Message received:', data);
    });
  }

  sendMessage(recipientId: string, message: string) {
    this.socket.emit('sendMessage', { recipientId, message });
  }
}
