export default class ChatSocket {
  constructor() {
    this.io = io(`http://localhost:3000/chat`, {
      withCredentials: true,
    });
  }

  async connectWebSocket() {
    this.io.on('connect', () => {
      console.log('WebSocket 연결 성공');
      this.joinRooms(); // 소켓 연결 시 모든 룸과 연결하기
      this.receiveMessage(); // 실시간 메시지 받기
    });

    this.io.on('disconnect', () => {
      console.log('WebSocket 연결 끊김');
    });
  }

  // 모든 메시지 가져오기 전송
  handleJoinRoomMessages(roomId, roomName) {
    console.log('get all messages');
    this.io.emit('handlejoinRoomMessages', { roomId, roomName });

    // 모든 메시지 가져오기 수신
    this.io.on('joinRoomMessages', (data) => {
      const messagesList = document.getElementById('messages');
      messagesList.innerHTML = ''; // 기존 메시지를 초기화

      for (let i = data.length - 1; i > 0; i--) {
        this.makeSpeechBubble(data[i]);
      }
    });
  }

  // 방 생성
  createRoom(recipientId) {
    this.io.emit('createRoom', recipientId);
    // 생성된 방 수신
    this.io.on('createdRoom', (room) => {
      console.log(`Created room: ${room}`);
    });
  }

  // 방 조인
  joinRooms() {
    this.io.emit('joinRooms');

    // 조인된 방 수신
    this.io.on('joinedRooms', (room) => {
      console.log(`Joined room: ${room}`);
    });
  }

  // 방 메시지 전송
  sendMessage(roomId, roomName, message) {
    if (message) {
      this.io.emit('message', { roomId, roomName, message });
      console.log(message);
    }
  }

  // 메시지 수신
  receiveMessage() {
    this.io.on('getMessage', (data) => {
      console.log('get message: ', data);
      this.makeSpeechBubble(data);
    });
  }

  // 말풍선 생성
  makeSpeechBubble(data) {
    console.log('make speech bubble');
    try {
      let item = document.createElement('li');

      if (!data.type) {
        throw new Error('지정된 타입이 없습니다.');
      }
      switch (data.type) {
        case 'text':
          item.innerHTML = `
            <div class="speachBubble ${data.type}">
              <li class="timestamp">${data.timestamp}</li>
              <li class="sender">${data.sender}</li>
              <li class="content">${data.content}</li>
            </div>
          `;
          break;

        case 'file':
          item.innerHTML = `
            <div class="speachBubble ${data.type}">
              <li class="timestamp">${data.timestamp}</li>
              <li class="sender">${data.sender}</li>
              <img class="content" src="${data.content}" onclick="openImage(this.src)">
            </div>
          `;
          break;
      }

      document.getElementById('messages').appendChild(item);
    } catch (error) {
      throw error;
    }
  }
}
