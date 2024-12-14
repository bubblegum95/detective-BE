// authModule.js
import Fetch from './fetch.module.js';

export default class Auth extends Fetch {
  async consumerSignUp(formData) {
    const contentData = 'application/json';
    const url = `http://localhost:5050/auth/signup/consumer`;

    try {
      const response = await super.post(url, contentData, formData);
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
    const contentData = 'application/json';
    const url = `http://localhost:5050/auth/signup/employee`;

    try {
      const response = super.post(url, contentData, formData);
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
    const contentData = 'multipart/form-data';
    const url = `http://localhost:5050/auth/signup/employer`;

    try {
      const response = super.post(url, contentData, formData);
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
      const url = `http://localhost:5050/auth/signin`;
      const contentData = 'application/json';
      const response = await super.post(url, contentData, formData);
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
