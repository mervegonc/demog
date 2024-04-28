import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles/Signup.css';
import openEyeIcon from './styles/images/open-eye.png';
import closeEyeIcon from './styles/images/close-eye.png';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    passwordReminder: '' // Ekleyin
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(true);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = async e => {
    e.preventDefault();
  
    // Şifrenin kontrolü
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      alert('Password must contain at least one uppercase letter, one lowercase letter, one digit, and must be at least 8 characters long.');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:8080/api/auth/signup', {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        passwordReminder: formData.passwordReminder // Ekleyin
      });
      console.log('Signup Response:', response.data);
      setFormData({
        name: '',
        username: '',
        email: '',
        password: '',
        passwordReminder: '' // Ekleyin
      });
      setSuccessMessage('Signed up successfully');
      setShowForm(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error.response.data.message);
      setSuccessMessage('');
      alert(error.response.data.message);
    }
  };
  
/*
 const handleSubmit = async e => {
    e.preventDefault();

    // Şifrenin kontrolü
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      alert('Password must contain at least one uppercase letter, one lowercase letter, one digit, and must be at least 8 characters long.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/auth/signup', formData);
      console.log('Signup Response:', response.data);
      setFormData({
        name: '',
        username: '',
        email: '',
        password: ''
      });
      setSuccessMessage('Signed up successfully');
      setShowForm(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error.response.data.message);
      setSuccessMessage('');
      alert(error.response.data.message);
    }
  };*/
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      <h2>Sign Up</h2>
      {successMessage && <p>{successMessage}</p>}
      {showForm && (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name"></label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" />
          </div>
          <div>
            <label htmlFor="username"></label>
            <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} placeholder="Choose a username" />
          </div>
          <div>
            <label htmlFor="email"></label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" />
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
          <div>
  <label htmlFor="passwordReminder"></label>
  <input type="text" name="passwordReminder" id="passwordReminder" value={formData.passwordReminder} onChange={handleChange} placeholder="Enter your password reminder" />
</div>

          <button type="submit">Sign Up</button>
        </form>
      )}
    </div>
  );
};

export default SignupForm;
