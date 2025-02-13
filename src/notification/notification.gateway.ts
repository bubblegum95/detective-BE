import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { NotificationService } from './notification.service';
import { Namespace, Server, Socket } from 'socket.io';
import { UserInfo } from '../utils/decorators/decorator';
import { NotificationType } from './type/notification.type';
import { Logger, UseGuards } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../utils/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@WebSocketGateway({ namespace: '/notification' })
export class NotificationGateway {
  constructor(private readonly notificationService: NotificationService) {}

  @WebSocketServer()
  server: Server;

  @WebSocketServer()
  notification: Namespace;

  @WebSocketServer()
  chat: Namespace;

  private readonly logger = new Logger(NotificationGateway.name);

  @SubscribeMessage('findMessageReceivers')
  async findMessageReceivers(roomId: number, sender: number) {
    this.logger.log('find messege receivers');

    const receivers: User[] = await this.notificationService.findMessageReceiver(roomId);
    for (const receiver of receivers) {
      const data = {
        type: NotificationType.Message,
        sender: sender,
        receiver: receiver,
        content: `${sender} 님이 메시지를 보내셨습니다.`,
      };
      console.log('알림: ', data);
      const notification = await this.notificationService.saveNotification(data);
      this.server.to('roomId').emit('notification', notification);
    }
  }

  @SubscribeMessage('readNotNotifications')
  async readNotNotifications(@ConnectedSocket() client: Socket, @UserInfo() user: User) {
    const data = await this.notificationService.getNotReadNotification(user.id);
    client.emit('isNotReadNotifications', data);
  }

  @SubscribeMessage('isRead') // 읽은 알림 처리하기
  async isRead(
    @ConnectedSocket() client: Socket,
    @UserInfo() user: User,
    @MessageBody() notificationId: string,
  ) {
    const data = await this.notificationService.isReadNotification(notificationId);
  }
}
