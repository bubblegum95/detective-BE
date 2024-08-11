import Fatch from './fetch.module.js';

export default class ChatRoom extends Fatch {
  async getRooms(chatList) {
    try {
      const url = `http://localhost:3001/user/chatrooms`;
      const response = await super.get(url);
      const data = await response.json();

      if (data.success === true) {
        alert(data.message);
        console.log(data.data);

        chatList.innerHTML = '';

        data.data.forEach((room) => {
          // 룸 리스트 랜더링
          const roomElement = document.createElement('div');

          roomElement.innerHTML = `
            <a href="#" onclick="openModal(${room.id}, '${room.name}')">
              <div>
                <p class="roomId">${room.id}</p>
                <p class="roomName">${room.name}</p>
                <p class="createdAt">${room.createdAt}</p>
                <p class="users">${room.participants}</p>
              </div>
            </a>
          `;

          chatList.appendChild(roomElement);
        });
      } else if (data.success === false) {
        alert(data.message);
      }
    } catch (error) {
      alert(error.message);
    }
  }

  async upload(formData) {
    try {
      const url = 'http://localhost:3001/chat/chatfile';
      const contentData = 'multipart/form-data';
      const response = super.post(url, contentData, formData);

      if (response.success === true) {
        alert(response.message);
      } else alert(response.message);
    } catch (error) {
      alert(error.message);
    }
  }
}
