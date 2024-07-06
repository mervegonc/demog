

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthService from './AuthService';
import openEyeIcon from './styles/images/open-eye.png';
import closeEyeIcon from './styles/images/close-eye.png';

const SigninForm = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false); // Durumunu kontrol etmek için useState kullanıyoruz
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      AuthService.setToken('');
      const response = await axios.post('http://16.16.43.64:8080/api/auth/signin', formData);
      const token = response.data.accessToken;
      const userId = response.data.userId;
      AuthService.setToken(token);
      AuthService.setUserId(userId);
      navigate(`/user/${userId}`);
      /*  navigate('/profile')*/
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Şifrenin görünürlüğünü değiştiren fonksiyon
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="usernameOrEmail"></label>
          <input type="text" name="usernameOrEmail" id="usernameOrEmail" value={formData.usernameOrEmail} onChange={handleChange} placeholder="Email or Username" />
        </div>
        <div>
          <label htmlFor="password"></label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type={showPassword ? 'text' : 'password'} name="password" id="password" value={formData.password} onChange={handleChange} placeholder="Password" />
            <img src={showPassword ? closeEyeIcon : openEyeIcon} alt="Password visibility toggle" onClick={togglePasswordVisibility} style={{ cursor: 'pointer', marginLeft: '-25px', marginTop: '-15px', width: '20px', height: '20px' }} />
          </div>
        </div>
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};

export default SigninForm;
