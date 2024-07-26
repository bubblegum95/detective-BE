import FatchModule from './fetch.module.js';

export default class ChatModule extends FatchModule {
  async getRooms(chatList) {
    try {
      const url = 'http://localhost:3000/user/chatrooms';
      const response = await super.get(url);
      const data = await response.json();

      if (data.success === true) {
        alert(data.message);

        // 기존의 내용을 모두 지웁니다.
        chatList.innerHTML = '';

        // data.data.room을 순회하면서 각 방 정보를 추가합니다.
        data.data.forEach((room) => {
          const roomElement = document.createElement('div');
          const users = room.user.map((a) => a.nickname);

          roomElement.innerHTML = `
            <a href="#" onclick="openModal('${room.name}')">
              <div>
                <p class="roomId">${room.id}</p>
                <p class="roomName">${room.name}</p>
                <p class="createdAt">${room.createdAt}</p>
                <p class="users">${[...users]}</p>
              </div>
            </a>
          `;
          chatList.appendChild(roomElement);
        });
      } else {
        alert({ 'error message': data.message });
      }
    } catch (error) {
      alert(error.message);
    }
  }

  async upload(formData) {
    const url = 'http://localhost:3000/s3/chatfile';
    const contentData = 'multipart/form-data';
    const response = super.post(url, contentData, formData);
    console.log('파일 업로드 성공');
  }

  async download(node) {}
}
