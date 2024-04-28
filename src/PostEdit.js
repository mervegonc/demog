import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from './axios';
import './styles/PostEdit.css';

const PostEdit = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/post/${postId}`);
        setTitle(response.data.title);
        setText(response.data.text);
      } catch (error) {
        console.error('Error fetching post details:', error);
      }
    };

    fetchPostDetails();
  }, [postId]);

  const handleEditPost = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:8080/api/post/${postId}`,
        { title, text },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log('Post updated successfully:', response.data);
      // Burada gerekirse kullanıcıya başarılı bir mesaj gösterebilirsiniz.
      navigate('/user/:userId'); // MyPost.js'e yönlendir
    } catch (error) {
      console.error('Error updating post:', error);
      // Hata durumunda kullanıcıya uygun geri bildirim sağlanabilir.
    }
  };

  const handleCancelEdit = () => {
    navigate('/user/:userId" '); // MyPost.js'e yönlendir
  };

  return (
    <div className='post-edit-panel'>
      <h2>Edit Post</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleEditPost(); }}>
        <label htmlFor="title">Title:</label>
        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label htmlFor="text">Text:</label>
        <textarea id="text" value={text} onChange={(e) => setText(e.target.value)}></textarea>
        <button type="submit">Save</button>
        <button type="button" onClick={handleCancelEdit}>Cancel</button>
      </form>
    </div>
  );
};

export default PostEdit;
