import React, { useState } from 'react';
import axios from 'axios';
import './styles/ForgotPassword.css';
import { useNavigate } from 'react-router-dom'; // useNavigate ekleyin
import openEyeIcon from './styles/images/open-eye.png';
import closeEyeIcon from './styles/images/close-eye.png';

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    passwordReminder: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(true);
  const navigate = useNavigate(); // useNavigate hook'unu kullanın

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8080/api/auth/forgotpassword', formData);
      console.log('Forgot Password Response:', response.data);
      // İşlem başarılı olduğunda kullanıcıya bir mesaj gösterebilirsiniz
      navigate('/'); // Şifre değiştirme işlemi başarılı olduğunda giriş sayfasına yönlendirme
    } catch (error) {
      console.error('Error:', error.response.data.message);
      // Hata durumunda kullanıcıya bir hata mesajı gösterebilirsiniz
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <div className="forgot-password-container">
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="usernameOrEmail">Username or Email</label>
          <input type="text" name="usernameOrEmail" id="usernameOrEmail" value={formData.usernameOrEmail} onChange={handleChange}  placeholder="Enter your Username or Email"/>
        </div>
        <div>
          <label htmlFor="passwordReminder">Reminder</label>
          <input type="text" name="passwordReminder" id="passwordReminder" value={formData.passwordReminder} onChange={handleChange} placeholder="Enter your password reminder keyword" />
        </div>
        <div>
            <label htmlFor="password"></label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
              <img
                src={showPassword ? closeEyeIcon : openEyeIcon}
                alt={showPassword ? 'Hide Password' : 'Show Password'}
                onClick={togglePasswordVisibility}
                style={{ width: '25px', height: '25px', cursor: 'pointer', position: 'absolute', right: '10px', top: '50%',marginTop:'-6px', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>
        
        <button type="submit">Change Password</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
