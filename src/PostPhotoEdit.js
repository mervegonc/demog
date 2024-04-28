/*

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from './axios';
import './styles/PostPhotoEdit.css';
import AuthService from './AuthService';

const PostPhotoEdit = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSavePhoto = async () => {
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
      navigate('/myPost');
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  const handleCancel = () => {
    navigate('/myPost');
  };

  return (
    <div className="post-edit-panel">
      <h2>Change Post Photo</h2>
      {previewUrl && (
        <div className="image-preview">
          <img src={previewUrl} alt="Preview" />
        </div>
      )}
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleSavePhoto}>Save</button>
      <button onClick={handleCancel}>Cancel</button>
    </div>
  );
};

export default PostPhotoEdit;
*/


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from './axios';
import './styles/PostPhotoEdit.css';
import AuthService from './AuthService';

const PostPhotoEdit = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [postPhotoUrl, setPostPhotoUrl] = useState(null);

  // Mevcut post fotoğrafını getir
  useEffect(() => {
    const fetchPostPhoto = async () => {
      try {
        const token = AuthService.getToken();
        const response = await axios.get(`http://localhost:8080/api/post/photos/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: 'blob' // Response tipini belirt
        });
        const imageUrl = URL.createObjectURL(response.data);
        setPostPhotoUrl(imageUrl);
      } catch (error) {
        console.error('Error fetching post photo:', error);
      }
    };

    fetchPostPhoto();
  }, [postId]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };
  

  const handleSavePhoto = async () => {
    const formData = new FormData();
    formData.append('files', selectedFile);
    navigate('/user/:userId" ');
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${AuthService.getToken()}`
      }
    };

    try {
      const response = await axios.put(`http://localhost:8080/api/post/photos/${postId}`, formData, config);
      console.log('Photo uploaded successfully!', response.data);
      navigate('/user/:userId" ');
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  const handleCancel = () => {
    navigate('/user/:userId" ');
  };

  return (
    <div className="post-edit-panel">
      <h2>Change Post Photo</h2>
      {/* Dosya seçme inputu */}
      <input type="file" onChange={handleFileChange} />
      {/* Mevcut post fotoğrafını veya yükleme önizlemesini göster */}
      {previewUrl ? (
        <div className="image-preview">
          <img src={previewUrl} alt="Preview" />
        </div>
      ) : postPhotoUrl ? (
        <div className="image-preview">
          <img src={postPhotoUrl} alt="Preview" />
        </div>
      ) : null}
      {/* Kaydet ve İptal et butonları */}
      <button onClick={handleSavePhoto}>Save</button>
      <button onClick={handleCancel}>Cancel</button>
    </div>
  );
};

export default PostPhotoEdit;
