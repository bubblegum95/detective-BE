import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { OnModuleInit, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserInfo } from '../utils/user-info.decorator';
import { User } from '../user/entities/user.entity';

@UseGuards(JwtAuthGuard)
@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('Init');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  requestUserInfo(client: Socket) {
    client.emit('requestUserInfo');
  }

  private rooms = new Map<string, Set<string>>(); // 룸 관리를 위한 맵

  @SubscribeMessage('createRoom')
  handleCreateRoom(client: Socket, roomId: string, @UserInfo() user: User): void {
    // 새로운 룸 생성
    this.rooms.set(roomId, new Set<string>());
    console.log(`Room ${roomId} created.`);
    console.log('user: ', user);
  }

  @SubscribeMessage('inviteToRoom')
  handleInviteToRoom(client: Socket, data: { roomId: string; invitedUserId: string }): void {
    const { roomId, invitedUserId } = data;
    if (this.rooms.has(roomId)) {
      // 초대된 사용자를 룸에 추가
      this.rooms.get(roomId).add(invitedUserId);
      console.log(`User ${invitedUserId} invited to room ${roomId}.`);
      // 초대된 사용자에게 초대 메시지 전송 (예시)
      this.server.to(invitedUserId).emit('roomInvitation', { roomId });
    } else {
      console.log(`Room ${roomId} does not exist.`);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, roomId: string): void {
    // 사용자가 룸에 입장
    client.join(roomId);
    console.log(`User ${client.id} joined room ${roomId}.`);
  }

  private removeClientFromRooms(clientId: string): void {
    this.rooms.forEach((users, roomId) => {
      if (users.has(clientId)) {
        users.delete(clientId);
        console.log(`User ${clientId} left room ${roomId}.`);
      }
    });
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: { room: string; message: string },
    @ConnectedSocket() client: Socket,
    @UserInfo() user: User,
    server: Server,
  ): void {
    console.log('data: ', data);
    console.group('user: ', client);
    this.server.to(data.room).emit('message', data.message);
  }
}
