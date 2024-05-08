import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from './AuthService';
import { Link, useLocation } from 'react-router-dom';
import './styles/PostForm.css';
import FileUpload from './FileUpload';
import savePostImage from './styles/images/savepost.png';

const PostForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    postId: null // Yeni bir postId state'i ekledik
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const location = useLocation();

  useEffect(() => {
    if (location.state) {
      const { title, text, photoUrl, postId } = location.state;
      setFormData({ title, text, postId });
    }
  }, [location]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.text.trim()) {
      alert('Please enter title and text');
      return;
    }
  
    try {
      const postData = { ...formData, userId: AuthService.getUserId() };
      const config = {
        headers: { Authorization: `Bearer ${AuthService.getToken()}` }
      };
  
      let response;
      if (formData.postId) {
        response = await axios.put(`http://localhost:8080/api/post/${formData.postId}`, postData, config);
        alert('Updated Successfully');
      } else {
        response = await axios.post('http://localhost:8080/api/post', postData, config);
        alert('Post created successfully');
        // Yeni bir postId aldığımızda state'i güncelliyoruz
        setFormData({ ...formData, postId: response.data.id });
      }
  
      // Fotoğraf seçilmiş mi kontrol et
      if (selectedFiles.length > 0) {
        const updatedPostId = response.data.id;
        await uploadPhotos(updatedPostId);
      }
  
      setFormData({ title: '', text: '' });
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error creating or updating post:', error);
    }
  };
  
  /*const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.text.trim()) {
      alert('Please enter title and text');
      return;
    }
  
    try {
      const postData = { ...formData, userId: AuthService.getUserId() };
      const config = {
        headers: { Authorization: `Bearer ${AuthService.getToken()}` }
      };
  
      let response;
      if (formData.postId) {
        response = await axios.put(`http://localhost:8080/api/post/${formData.postId}`, postData, config);
        alert('Updated Successfully');
      } else {
        response = await axios.post('http://localhost:8080/api/post', postData, config);
        alert('Post created successfully');
        // Yeni bir postId aldığımızda state'i güncelliyoruz
        setFormData({ ...formData, postId: response.data.id });
      }
  
      const updatedPostId = response.data.id;
      await uploadPhotos(updatedPostId);
  
      setFormData({ title: '', text: '' });
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error creating or updating post:', error);
    }
  };*/
  
  const uploadPhotos = async postId => {
    const photoFormData = new FormData();
    selectedFiles.forEach(file => {
      // Dosyaları 'files' adında bir FormData içerisine ekliyoruz
      photoFormData.append('files', file);
    });
  
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${AuthService.getToken()}`
      }
    };
  
    try {
      await axios.put(`http://localhost:8080/api/post/photos/${postId}`, photoFormData, config);
      console.log('Photos uploaded successfully!');
    } catch (error) {
      console.error('Error uploading photos:', error);
    }
  };

  const handleFileChange = files => {
    setSelectedFiles(files);
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
        <FileUpload onFileChange={handleFileChange} />
      </div>
      <div>
        <img src={savePostImage} onClick={handleSubmit} className='save-post'/>
      </div>

     
      <div className="button-container">
        <Link to="/post" className="home-button"></Link>
        <Link to={`/user/${AuthService.getUserId()}`} className="profile-button"></Link>
        <Link to="/search" className="search-button"></Link>
        <Link to="/postform" className="create-button"></Link>
      </div>
    </div>
  );
};

export default PostForm;
