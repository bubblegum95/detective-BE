// authModule.js
import FetchModule from './fetch.module.js';
import connectWebSocket from './socket.module.js';

export default class AuthModule extends FetchModule {
  async consumerSignUp(formData) {
    const method = 'POST';
    const contentData = 'application/json';
    const url = 'http://localhost:3000/auth/signup/consumer';

    try {
      const response = await super.fetchMethod(method, url, contentData, formData);
      const data = await response.json();

      if (data.success === true) {
        alert(data.message);

        window.location.href = './signin.html';
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  }

  async employeeSignUp(formData) {
    const method = 'POST';
    const contentData = 'multipart/form-data';
    const url = 'http://localhost:3000/auth/signup/employee';

    try {
      const response = super.fetchMethod(method, contentData, url, formData);
      const data = await response.json();

      if (data.success === true) {
        alert(data.message);

        window.location.href = './signin.html';
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  }

  async employerSignUP(formData) {
    const method = 'POST';
    const contentData = 'multipart/form-data';
    const url = 'http://localhost:3000/auth/signup/employer';

    try {
      const response = super.fetchMethod(method, contentData, url, formData);
      const data = await response.json();

      if (data.success === true) {
        alert(data.message);

        window.location.href = './signin.html';
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  }

  async signIn(formData) {
    try {
      const response = await super.fetchMethod(method, url, contentData, formData);
      const data = await response.json();

      if (data.success === true) {
        alert(data.message);

        window.location.href = './index.html';
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  }
}
