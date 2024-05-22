/*import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AuthService from './AuthService';
import { Link } from 'react-router-dom';
import './styles/Post.css';

const CommentForm = ({ postId, refreshComments }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [commentedUserId, setCommentedUserId] = useState(null);
  const [commentedUserName, setCommentedUserName] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const commentBoxRef = useRef(null);

  useEffect(() => {
    const fetchCommentedUserInfo = async () => {
      try {
        const token = AuthService.getToken();
        const response = await axios.get(`http://localhost:8080/api/user/${commentedUserId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCommentedUserName(response.data.name);
      } catch (error) {
        console.error('Error fetching commented user info:', error);
      }
    };

    if (commentedUserId) {
      fetchCommentedUserInfo();
    }
  }, [commentedUserId]);

  const toggleCommentBox = () => {
    setIsOpen(!isOpen);
    setSelectedPostId(postId);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmitComment = async () => {
    try {
      const token = AuthService.getToken();
      const userId = AuthService.getUserId();
      const response = await axios.post('http://localhost:8080/api/comment', {
        userId,
        postId,
        text: comment
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Response from server:', response.data);
      setComment('');
      setIsOpen(false);
      refreshComments(); // Refresh the comments after submitting
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleClickOutside = (event) => {
    if (commentBoxRef.current && !commentBoxRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
      <button className="add-comment-button" onClick={toggleCommentBox}></button>
      {isOpen && (
        <div className="comment-box" ref={commentBoxRef}>
          <textarea
            value={comment}
            onChange={handleCommentChange}
            placeholder="Write your comment here..."
          ></textarea>
          <button onClick={handleSubmitComment}>save</button>
        </div>
      )}
      {commentedUserId && (
        <div>
          <p>Commented by: <Link to={`/user/${commentedUserId}`}>{commentedUserName}</Link></p>
        </div>
      )}
    </div>
  );
};

export default CommentForm;
*/
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AuthService from './AuthService';
import { Link } from 'react-router-dom';
import './styles/Post.css';

const CommentForm = ({ postId, refreshComments }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [commentedUserId, setCommentedUserId] = useState(null);
  const [commentedUserName, setCommentedUserName] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const commentBoxRef = useRef(null);

  useEffect(() => {
    const fetchCommentedUserInfo = async () => {
      try {
        const token = AuthService.getToken();
        const response = await axios.get(`http://localhost:8080/api/user/${commentedUserId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCommentedUserName(response.data.name);
      } catch (error) {
        console.error('Error fetching commented user info:', error);
      }
    };

    if (commentedUserId) {
      fetchCommentedUserInfo();
    }
  }, [commentedUserId]);

  const toggleCommentBox = () => {
    setIsOpen(!isOpen);
    setSelectedPostId(postId);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmitComment = async () => {
    try {
      const token = AuthService.getToken();
      const userId = AuthService.getUserId();
      const response = await axios.post('http://localhost:8080/api/comment', {
        userId,
        postId,
        text: comment
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Response from server:', response.data);
      setComment('');
      setIsOpen(false);
      refreshComments(); // Refresh the comments after submitting
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleClickOutside = (event) => {
    if (commentBoxRef.current && !commentBoxRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
      <button className="add-comment-button" onClick={toggleCommentBox}></button>
      {isOpen && (
        <div className="comment-box" ref={commentBoxRef}>
          <textarea
            value={comment}
            onChange={handleCommentChange}
            placeholder="Write your comment here..."
          ></textarea>
          <button onClick={handleSubmitComment}>save</button>
        </div>
      )}
      {commentedUserId && (
        <div>
          <p>Commented by: <Link to={`/user/${commentedUserId}`}>{commentedUserName}</Link></p>
        </div>
      )}
    </div>
  );
};

export default CommentForm;
