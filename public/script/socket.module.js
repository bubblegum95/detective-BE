export default class SocketModule {
  constructor() {
    this.io = io('http://localhost:3000', {
      withCredentials: true,
    });
  }

  async connectWebSocket() {
    this.io.on('connect', () => {
      console.log('WebSocket 연결 성공');
      this.joinRooms(); // 소켓 연결 시 모든 룸과 연결하기
      this.getMessages(); // 연결된 룸에 메시지 받기
      this.readNotNotifications(); // 아직 읽지 않은 알림 가져오기
    });

    this.io.on('disconnect', () => {
      console.log('WebSocket 연결 끊김');
    });
  }

  getMessages() {
    this.io.on('getMessage', (data) => {
      this.makeSpeechBubble(data);
    });
  }

  handleJoinRoomMessages(roomId) {
    console.log('get all messages');
    this.io.emit('handlejoinRoomMessages', roomId);

    this.io.on('joinRoomMessages', (data) => {
      console.log(data);
      const messagesList = document.getElementById('messages');
      messagesList.innerHTML = ''; // 기존 메시지를 초기화

      for (let i = data.length - 1; i > 0; i--) {
        this.makeSpeechBubble(data[i]);
      }
    });
  }

  createRoom(recipientId) {
    this.io.emit('createRoom', recipientId);
    document.getElementById('recipientIdInput').value = '';
    this.io.on('createdRoom', (room) => {
      console.log(`Created room: ${room}`);
    });
  }

  joinRooms() {
    this.io.emit('joinRooms');
    this.io.on('joinedRooms', (room) => {
      console.log(`Joined room: ${room}`);
    });
  }

  sendMessage(room, message) {
    if (message) {
      this.io.emit('message', { message, room });
      console.log(message);
    }
  }

  makeSpeechBubble(data) {
    const item = document.createElement('li');
    item.textContent = `${data.timestamp}: ${data.sender}: ${data.content}`;
    document.getElementById('messages').appendChild(item);
  }

  // 여기서 부터는 알림 서비스
  notification() {
    this.io.on('notification', (data) => {
      console.log('data: ', data);

      creatNotificationItems(data);
    });
  }

  readNotNotifications() {
    this.io.emit('readNotNotifications');
    this.io.on('isNotReadNotifications', (data) => {
      console.log(data);

      for (let i = data.length - 1; i > 0; i--) {
        creatNotificationItems(data[i]);
      }
    });
  }

  creatNotificationItems(data) {
    const item = document.createElement('div');

    switch (data.type) {
      case 'message':
        item.innerHTML = `<a href="./my.chat.html" onclick="readNotification()" id="${data.id}" class="${data.type}">${data.type}:${data.content}:${data.timestamp}:${data.read}</a>`;
        break;

      case 'onboarding':
        item.innerHTML = `<a href="알림 타입에 따라서 화면 전환" onclick="readNotification()" id="${data.id}" class="${data.type}">${data.type}:${data.content}:${data.timestamp}:${data.read}</a>`;
        break;

      default:
        item.innerHTML = `<a href="알림 타입에 따라서 화면 전환" onclick="readNotification()" id="${data.id}" class="${data.type}">${data.type}:${data.content}:${data.timestamp}:${data.read}</a>`;
        break;
    }

    document.getElementById('notifications').appendChild(item);
  }

  readNotification(notificationId) {
    // 클릭한 알람은 알림창에서 없어지도록 하기
    this.io.emit('isRead', notificationId);
  }
}
