import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from './AuthService';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './styles/ArticleForm.css';
import FileUpload from './FileUpload';
import savePostImage from './styles/images/savepost.png';

const ArticleForm = () => {
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    articleId: null // Yeni bir articleId state'i ekledik
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (location.state) {
      const { subject, content, photoUrl, articleId } = location.state;
      setFormData({ subject, content, articleId });
    }
  }, [location]);

  const handleChange = e => {
    const { name, value } = e.target;
    const formattedValue = value.split(' ').map(word => {
      if (word.length > 120) {
        return word.match(/.{1,70}/g).join('\n');
      }
      return word;
    }).join(' ');
    setFormData({ ...formData, [name]: formattedValue });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.content.trim()) {
      alert('Please enter subject and content');
      return;
    }

    try {
      const articleData = { ...formData, userId: AuthService.getUserId() };
      const config = {
        headers: { Authorization: `Bearer ${AuthService.getToken()}` }
      };

      let response;
      if (formData.articleId) {
        response = await axios.put(`http://localhost:8080/api/article/${formData.articleId}`, articleData, config);
        alert('Updated Successfully');
        navigate(`/onearticle/${response.data.id}`);
      } else {
        response = await axios.post('http://localhost:8080/api/article', articleData, config);
        alert('Article created successfully');
        // Yeni bir articleId aldığımızda state'i güncelliyoruz
        setFormData({ ...formData, articleId: response.data.id });
        // Redirect to OnePost component with the new articleId
        navigate(`/onearticle/${response.data.id}`);
      }

      // Fotoğraf seçilmiş mi kontrol et
      if (selectedFiles.length > 0) {
        const updatedArticleId = response.data.id;
        await uploadPhotos(updatedArticleId);
      }

      setFormData({ subject: '', content: '' });
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error creating or updating article:', error);
    }
  };
  /*
    const handleSubmit = async e => {
      e.preventDefault();
      if (!formData.subject.trim() || !formData.content.trim()) {
        alert('Please enter subject and content');
        return;
      }
    
      try {
        const articleData = { ...formData, userId: AuthService.getUserId() };
        const config = {
          headers: { Authorization: `Bearer ${AuthService.getToken()}` }
        };
    
        let response;
        if (formData.articleId) {
          response = await axios.put(`http://localhost:8080/api/article/${formData.articleId}`, articleData, 
            config);
          alert('Updated Successfully');
        } else {
          response = await axios.post('http://localhost:8080/api/article', articleData, config);
          alert('Article created successfully');
          // Yeni bir articleId aldığımızda state'i güncelliyoruz
          setFormData({ ...formData, articleId: response.data.id });
        }
    
        // Fotoğraf seçilmiş mi kontrol et
        if (selectedFiles.length > 0) {
          const updatedArticleId = response.data.id;
          await uploadPhotos(updatedArticleId);
        }
    
        setFormData({ subject: '', content: '' });
        setSelectedFiles([]);
      } catch (error) {
        console.error('Error creating or updating article:', error);
      }
    };*/

  const uploadPhotos = async articleId => {
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
      await axios.put(`http://localhost:8080/api/article/photos/${articleId}`, photoFormData,
        config);
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
      <form className='apost-form-area' onSubmit={handleSubmit}>
        <div className='title'>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Please Write Your Article Subject"
          />
        </div>
        <div className='atext'>
          <textarea
            type="text"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Please Write Your Article Content"
          />
        </div>
      </form>
      <div className="custom-file-upload">
        <FileUpload onFileChange={handleFileChange} />
      </div>
      <div>
        <img src={savePostImage} onClick={handleSubmit} className='save-article' />
      </div>
      <div className="button-container">
        <Link to="/post" className="home-button"></Link>
        <Link to="/article" className="article-button"></Link>
        <Link to={`/user/${AuthService.getUserId()}`} className="profile-button"></Link>
        <Link to="/search" className="search-button"></Link>
        <Link to="/articleform" className="article-create-button"></Link>
        <Link to="/postform" className="create-button"></Link>
      </div>
    </div>
  );
};

export default ArticleForm;
