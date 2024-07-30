export default class NotificationSocket {
  constructor() {
    this.io = io('http://localhost:3000/notification', {
      withCredentials: true,
    });
  }

  async connectWebSocket() {
    this.io.on('connect', () => {
      console.log('WebSocket 연결 성공');
      this.readNotNotifications(); // 아직 읽지 않은 알림 가져오기
    });

    this.io.on('disconnect', () => {
      console.log('WebSocket 연결 끊김');
    });
  }

  notified() {
    this.io.on('notification', (data) => {
      console.log('data: ', data);

      this.creatNotificationItems(data);
    });
  }

  readNotNotifications() {
    this.io.emit('readNotNotifications');
    this.io.on('isNotReadNotifications', (data) => {
      console.log(data);

      for (let i = data.length - 1; i > 0; i--) {
        this.creatNotificationItems(data[i]);
      }
    });
  }

  creatNotificationItems(data) {
    const item = document.createElement('div');
    // 알림 타입에 따라서 페이지 전환
    switch (data.type) {
      case 'message':
        item.innerHTML = `<a href="./my.chat.html" onclick="readNotification(id)" id="${data.id}" class="${data.type}">${data.type}:${data.content}:${data.timestamp}:${data.read}</a>`;
        break;

      case 'onboarding':
        item.innerHTML = `<a href="알림 타입에 따라서 화면 전환" onclick="readNotification(id)" id="${data.id}" class="${data.type}">${data.type}:${data.content}:${data.timestamp}:${data.read}</a>`;
        break;

      default:
        item.innerHTML = `<a href="알림 타입에 따라서 화면 전환" onclick="readNotification(id)" id="${data.id}" class="${data.type}">${data.type}:${data.content}:${data.timestamp}:${data.read}</a>`;
        break;
    }

    document.getElementById('notifications').appendChild(item);
  }

  // 확인한 알람은 알림창에서 pop
  readNotification(notificationId) {
    this.io.emit('isRead', notificationId);
  }
}
