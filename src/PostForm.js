import React, { useState,useRef  } from 'react';
import axios from 'axios';
import AuthService from './AuthService';
import { Link } from 'react-router-dom';
import './styles/PostForm.css';

const PostForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    text: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const [activeTab, setActiveTab] = useState('posts'); // Active tab: 'posts' or 'users'
  const userId = AuthService.getUserId(); // Get userId from AuthService
 

  const handleSubmit = async e => {
    e.preventDefault();
    // Başlık ve metin alanlarının dolu olup olmadığını kontrol et
    if (!formData.title.trim() || !formData.text.trim()) {
      alert('Please enter title and text');
      return; // Fonksiyonu burada sonlandır
    }

  
    try {
      const postData = { ...formData, userId: AuthService.getUserId() };
      const config = {
        headers: { Authorization: `Bearer ${AuthService.getToken()}` }
      };
  
      // Post oluşturma isteği gönder
      const response = await axios.post('http://localhost:8080/api/post', postData, config);
      console.log('Post created successfully!', response.data);
  
      // Post oluşturulduktan sonra fotoğraf yükleme işlemi kontrolü
      if (selectedFile) {
        await uploadPhoto(response.data.id);
      }
  
      // Show alert for successful posting
      alert('Posted Successfully');
  
      // Clear the text and title fields
      setFormData({ title: '', text: '' });
      // Clear selected file
      setSelectedFile(null);
  
      // Post creation completed, additional actions such as redirection or notification can be performed
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };
  
  


  const uploadPhoto = async postId => {
    const formData = new FormData();
    formData.append('files', selectedFile);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${AuthService.getToken()}`
      }
    };

    try {
      const response = await axios.put(`http://localhost:8080/api/post/photos/${postId}`, formData, config);
      console.log('Photo uploaded successfully!', response.data);
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  const handleFileChange = e => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <div className='post-form-container'>
        
      <form className='post-form-area' onSubmit={handleSubmit}>
        <div className='title'>
          <input 
            type="text" 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            placeholder="Please Write Your Post Title" 
          />
        </div>
        
        
        <div className='text'>
          <textarea 
            type="text" 
            name="text" 
            value={formData.text} 
            onChange={handleChange} 
            placeholder="Please Write Your Post Text" 
          />
        </div>
        
      </form>
     
     
      <div className="custom-file-upload">
        <label>
          <input type="file" name="file" onChange={handleFileChange} />Choose</label>
      </div>
      <div className='save-post'>
        <label type="button" onClick={handleSubmit}>Save Post</label>
      </div>

       <div className='post-photo-selected'>
 {selectedFile && (
      <img src={URL.createObjectURL(selectedFile)} alt="Selected" className="selected-image" />
    )}</div>
  
     
  
     


     

 <div className="button-container">
        <Link to="/post" className="home-button"></Link>
        <Link to={`/user/${userId}`} className="profile-button"></Link>
        <Link to="/search" className="search-button"></Link>
      
        <Link to="/postform" className="create-button"></Link>
      </div>

      
   </div>   
  );
  
};
export default PostForm;