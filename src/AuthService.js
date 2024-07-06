
import axios from 'axios';

const API_URL = 'http://16.16.43.64:8080/api/auth/';


class AuthService {
  login(username, password) {
    return axios
      .post(API_URL + 'signin', {
        username,
        password
      })
      .then(response => {
        if (response.data.accessToken) {
          this.setToken(response.data.accessToken); // Tokeni localStorage'e kaydet
          localStorage.setItem('userId', response.data.userId); // UserId'yi localStorage'e kaydet
        }
        return response.data; // Response'u doğrudan döndür
      });
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Tokeni kaldır
  }

  register(name, username, email, password, passwordReminder) {
    // Signup işlemi için Authorization başlığını kaldır
    return axios.post(API_URL + 'signup', {
      name,
      username,
      email,
      password,
      passwordReminder
    });
  }



  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  setToken(token) {
    localStorage.setItem('token', token); // 'accessToken' yerine 'token' olarak kaydediliyor
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setUserId(userId) {
    localStorage.setItem('userId', userId); // userId'i localStorage'e kaydet
  }

  getUserId() {
    return localStorage.getItem('userId'); // localStorage'dan userId al
  }

  // Yeni method: Access token'i isteklere ekler
  addAccessTokenToRequest(config) {
    const token = this.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
}

export default new AuthService();
