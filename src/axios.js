
import axios from 'axios';
import AuthService from './AuthService'; // Auth service eklenmiş

// Axios interceptor'ı tanımlayın
axios.interceptors.request.use(
  config => {
    const token = AuthService.getToken(); // Tokeni al
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // İsteğe tokeni ekle
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default axios;
