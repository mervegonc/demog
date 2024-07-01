
import React, { useState, useEffect, useRef } from 'react';
import axios from './axios';
import { useParams, Link } from 'react-router-dom';
import CommentForm from './CommentForm';
import './styles/Post.css';
import LikeForm from './LikeForm';
import './styles/OnePost.css';
import AuthService from './AuthService';
import UserCommentOptionIcon from './styles/images/optioncomment.png';
import RightClickIcon from './styles/images/rightclick.png';
import LeftClickIcon from './styles/images/leftclick.png';

const OnePost = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(true);
  const [user, setUser] = useState(null);
  const [userProfilePhoto, setUserProfilePhoto] = useState(null);
  const userId = AuthService.getUserId();
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const optionsPanelRef = useRef(null);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const postDataResponse = await axios.get(`http://localhost:8080/api/post/${postId}`);
        const postData = postDataResponse.data;
        if (postData) {
          setPost(postData);

          const userId = postData.userId;
          const userResponse = await axios.get(`http://localhost:8080/api/user/${userId}`);
          const userData = userResponse.data;
          setUser(userData);

          const userProfilePhotoResponse = await axios.get(`http://localhost:8080/api/user/profile/${userId}`, {
            responseType: 'blob',
            headers: {
              Authorization: `Bearer ${AuthService.getToken()}`
            }
          });
          const userProfilePhotoUrl = URL.createObjectURL(userProfilePhotoResponse.data);
          setUserProfilePhoto(userProfilePhotoUrl);

          const photoNamesResponse = await axios.get(`http://localhost:8080/api/post/photos/${postId}`);
          const photoUrls = await Promise.all(photoNamesResponse.data.map(async photoName => {
            try {
              const photoUrlResponse = await axios.get(`http://localhost:8080/api/post/photos/${postId}/${photoName}`, {
                responseType: 'blob'
              });
              const imageUrl = URL.createObjectURL(photoUrlResponse.data);
              return imageUrl;
            } catch (error) {
              console.error('Error fetching photo URL:', error);
              return null;
            }
          }));

          setPost(prevPost => ({
            ...prevPost,
            photoUrls: photoUrls,
            currentPhotoIndex: 0,
          }));
        } else {
          console.error('Post data is missing or incorrect.');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPostData();
  }, [postId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsPanelRef.current && !optionsPanelRef.current.contains(event.target)) {
        setShowOptionsPanel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [optionsPanelRef]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/comment/post/${postId}/comment`);
      const updatedComments = await Promise.all(response.data.map(async comment => {
        try {
          const userResponse = await axios.get(`http://localhost:8080/api/user/${comment.userId}`);
          const userProfilePhotoResponse = await axios.get(`http://localhost:8080/api/user/profile/${comment.userId}`, { responseType: 'blob' });
          const userProfilePhotoUrl = URL.createObjectURL(userProfilePhotoResponse.data);
          return { ...comment, userName: userResponse.data.username, userProfilePhoto: userProfilePhotoUrl };
        } catch (error) {
          console.error('Error fetching user:', error);
          return { ...comment, userName: 'Unknown', userProfilePhoto: null };
        }
      }));
      setComments(updatedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const handleShowComments = () => {
    setShowComments(!showComments);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:8080/api/comment/${userId}/${postId}/${commentId}`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`
        }
      });

      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleUserCommentOptionClick = (commentId, commentUserId, postUserId) => {
    if (userId === commentUserId || userId === postUserId) {
      setShowOptionsPanel(true);
      setSelectedCommentId(commentId);
    } else {
      setShowOptionsPanel(false);
      setSelectedCommentId(null);
    }
  };

  const handleNextPhoto = () => {
    setPost(prevPost => {
      const nextPhotoIndex = (prevPost.currentPhotoIndex + 1) % prevPost.photoUrls.length;
      return { ...prevPost, currentPhotoIndex: nextPhotoIndex };
    });
  };

  const handlePreviousPhoto = () => {
    setPost(prevPost => {
      const previousPhotoIndex = (prevPost.currentPhotoIndex + prevPost.photoUrls.length - 1) % prevPost.photoUrls.length;
      return { ...prevPost, currentPhotoIndex: previousPhotoIndex };
    });
  };

  const renderTextWithLinks = (text) => {
    if (!text) {
      return null;
    }
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.split(urlPattern).map((part, index) => {
      if (urlPattern.test(part)) {
        return <a key={index} href={part} target="_blank" rel="noopener noreferrer">{part}</a>;
      }
      return part;
    });
  };

  const renderVideoEmbed = (url) => {
    if (!url) return null;

    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isVimeo = url.includes('vimeo.com');

    if (isYouTube) {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      return (
        <iframe
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      );
    } else if (isVimeo) {
      const videoId = url.split('/').pop();
      return (
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          width="640"
          height="360"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Vimeo video player"
        ></iframe>
      );
    } else {
      return <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>;
    }
  };

  return (
    <div>
      <div className="profile-post-container">
        <div className="one-post-panel">
          {post && (
            <div>
              <div className="user-infos">
                <p className='article-create-date'>{post.formattedCreatedAt}</p>
                {userProfilePhoto && (
                  <img src={userProfilePhoto} alt={`Profile photo for ${user.username}`} className="user-photo-container" />
                )}
                <div className="user-name">
                  {user && (
                    <p><Link to={`/user/${user.id}`}>{user.username}</Link></p>
                  )}
                </div>
              </div>
  
              <div className="post-details">
                <p>{post.title}</p>
                <p>{renderTextWithLinks(post.text)}</p>
                {post.article ? (
                  <p><Link to={`/onearticle/${post.article.id}`}>{post.article.subject}</Link></p>
                ) : (
                  <p>{}</p>
                )}

                <div className="video-container">
                  {post.connections && renderVideoEmbed(post.connections, "video-class")}
                </div>
              </div>
  
              {!post.photoUrls || post.photoUrls.length === 0 ? (
                <div className="post-details"></div>
              ) : (
                <div className="post-photo-container">
                  <div style={{ position: 'relative' }}>
                    <img src={post.photoUrls[post.currentPhotoIndex]} alt={`Photo for post ${post.id}`} className="post-photo" />
                    {post.photoUrls.length > 1 && (
                      <div className='post-photos-clicks'>
                        <img src={RightClickIcon} alt="Right click icon" className="right-click-icon" onClick={handleNextPhoto} />
                        <img src={LeftClickIcon} alt="Left click icon" className="left-click-icon" onClick={handlePreviousPhoto} />
                      </div>
                    )}
                  </div>
                </div>
              )}
              {post.videoUrls && post.videoUrls.length > 0 && (
                <div className="post-video-container">
                  {post.videoUrls.map((videoUrl, index) => (
                    <video key={index} controls className="post-video">
                      <source src={videoUrl} type="video/mp4" />
                    </video>
                  ))}
                </div>
              )}
              <button className="see-all-comments-button" onClick={handleShowComments}></button>
            </div>
          )}
  
          <div className="like">
            <LikeForm postId={postId} />
          </div>
          <div className="comments-panel">
            <CommentForm postId={postId} refreshComments={fetchComments} />
          </div>
          {showComments && (
            <div className="comment-list-panel">
              <div className="comment-btm-panel">
                {comments.map(comment => (
                  <div key={comment.id} className="comment-panel">
                    <div className='comment-option-new'>
                      <img
                        src={UserCommentOptionIcon}
                        alt="Options"
                        className="comment-option-icon"
                        onClick={() => handleUserCommentOptionClick(comment.id, comment.userId, post.user.id)}
                      />
                      {showOptionsPanel && selectedCommentId == comment.id && (
                        <div ref={optionsPanelRef} className='user-comment-options-panel'>
                          <button className="comment-delete" onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                        </div>
                      )}
                    </div>
                    <p className='comment-create-date' style={{ marginTop: '17px', marginLeft: '500px' }}>{comment.formattedCreatedAt}</p>
                    <div className="comment-user-info">
                      {comment.userProfilePhoto && (
                        <Link to={`/user/${comment.userId}`}>
                          <img src={comment.userProfilePhoto} alt={`Profile photo for ${comment.userName}`} className="comment-user-photo" />
                        </Link>
                      )}
                      <div className="comment-username">
                        <p><Link className='comment-username' to={`/user/${comment.userId}`}>{comment.userName}</Link></p>
                      </div>
                    </div>
                    <div className="comment-user-text">
                      <p>{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="button-container">
        <Link to="/home" className="realhome-button"></Link>
        <Link to="/post" className="home-button"></Link>
        <Link to="/article" className="article-button"></Link>
        <Link to={`/user/${userId}`} className="profile-button"></Link>
        <Link to="/search" className="search-button"></Link>
        <Link to="/articleform" className="article-create-button"></Link>
        <Link to="/postform" className="create-button"></Link>
      </div>
    </div>
  );
};

export default OnePost;
