import React, { useState, useEffect } from 'react';
import axios from './axios';
import { Link } from 'react-router-dom';
import LikeForm from './LikeForm';
import './styles/Post.css';
import './styles/CommentForm.css';
import './styles/MyPost.css';
import AuthService from './AuthService';
import RightClickIcon from './styles/images/leftclick.png';
import LeftClickIcon from './styles/images/rightclick.png';
import ReloadIcon from './styles/images/reloadicon.png';


const Post = () => {
  const [posts, setPosts] = useState([]);
  const [postIds, setPostIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const userId = AuthService.getUserId();

  useEffect(() => {
    const fetchPostIds = async () => {
      try {
        const response = await axios.get('http://16.16.43.64:3000/api/post/allPostIds');
        const sortedPostIds = response.data.sort((a, b) => b - a);
        setPostIds(sortedPostIds);
      } catch (error) {
        console.error('Error fetching post IDs:', error);
      }
    };
    fetchPostIds();
  }, []);

  useEffect(() => {
    if (postIds.length > 0 && currentIndex === 0) {
      fetchPost(postIds[0]);
      setCurrentIndex(1);
    }
  }, [postIds]);

  const fetchPost = async (postId) => {
    try {
      const response = await axios.get(`http://16.16.43.64:3000/api/post/${postId}`);
      const post = response.data;

      const photoNamesResponse = await axios.get(`http://16.16.43.64:3000/api/post/photos/${post.id}`);
      const photoNames = photoNamesResponse.data;
      const photoUrls = await Promise.all(photoNames.map(async (photoName) => {
        const photoUrlResponse = await axios.get(`http://16.16.43.64:3000/api/post/photos/${post.id}/${photoName}`, {
          responseType: 'blob'
        });
        const imageUrl = URL.createObjectURL(photoUrlResponse.data);
        return { type: 'photo', url: imageUrl };
      }));

      const videoNamesResponse = await axios.get(`http://16.16.43.64:3000/api/post/videos/${post.id}`);
      const videoUrls = await Promise.all(videoNamesResponse.data.map(async (videoName) => {
        const videoUrlResponse = await axios.get(`http://16.16.43.64:3000/api/post/videos/${post.id}/${videoName}`, {
          responseType: 'blob'
        });
        const videoUrl = URL.createObjectURL(videoUrlResponse.data);
        return { type: 'video', url: videoUrl };
      }));

      const connections = post.connections ? [{ type: 'youtube', url: post.connections }] : [];

      const userProfilePhoto = await fetchUserProfilePhoto(post.userId);

      const newPost = {
        ...post,
        mediaContent: [...photoUrls, ...videoUrls, ...connections],
        userProfilePhoto,
        isCommentBoxOpen: false,
        selectedCommentText: '',
        currentMediaIndex: 0
      };

      setPosts((prevPosts) => [...prevPosts, newPost]);
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  };

  const fetchUserProfilePhoto = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://16.16.43.64:3000/api/user/profile/${userId}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const imageUrl = URL.createObjectURL(response.data);
      return imageUrl;
    } catch (error) {
      console.error('Error fetching user profile photo:', error);
      return null;
    }
  };

  const handleShowComments = async (postId) => {
    try {
      const response = await axios.get(`http://16.16.43.64:3000/api/comment/post/${postId}/comment`);
      const updatedComments = await Promise.all(response.data.map(async (comment) => {
        const userResponse = await axios.get(`http://16.16.43.64:3000/api/user/${comment.userId}`);
        const userProfilePhoto = await fetchUserProfilePhoto(comment.userId);
        return { ...comment, userName: userResponse.data.name, userProfilePhoto };
      }));
      setPosts((prevPosts) => prevPosts.map((post) => post.id === postId ? {
        ...post,
        selectedPostComments: updatedComments,
        isCommentBoxOpen: !post.isCommentBoxOpen,
        selectedCommentText: updatedComments.map(comment => comment.text).join('\n')
      } : post));
    } catch (error) {
      console.error('Error fetching comments:', error);
      setPosts((prevPosts) => prevPosts.map((post) => post.id === postId ? {
        ...post,
        selectedPostComments: [],
        isCommentBoxOpen: !post.isCommentBoxOpen,
        selectedCommentText: ''
      } : post));
    }
  };

  const handleNextMedia = (postId) => {
    setPosts((prevPosts) => prevPosts.map((post) => post.id === postId ? {
      ...post,
      currentMediaIndex: (post.currentMediaIndex + 1) % post.mediaContent.length
    } : post));
  };

  const handlePreviousMedia = (postId) => {
    setPosts((prevPosts) => prevPosts.map((post) => post.id === postId ? {
      ...post,
      currentMediaIndex: (post.currentMediaIndex + post.mediaContent.length - 1) % post.mediaContent.length
    } : post));
  };

  const renderTextWithLinks = (text) => {
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

  const renderCurrentMedia = (mediaContent, currentIndex) => {
    if (mediaContent.length === 0) return null;
    const currentMedia = mediaContent[currentIndex];
    if (currentMedia.type === 'photo') {
      return <img src={currentMedia.url} alt={`Content ${currentIndex}`} className="post-photo" />;
    } else if (currentMedia.type === 'video') {
      return (
        <video controls className="post-video">
          <source src={currentMedia.url} type="video/mp4" />
        </video>
      );
    } else if (currentMedia.type === 'youtube') {
      return renderVideoEmbed(currentMedia.url);
    }
  };

  const handleLoadMore = () => {
    if (currentIndex < postIds.length) {
      fetchPost(postIds[currentIndex]);
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div>
      <div className="profile-post-container">
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <div className="ones-post-panel">
                <p className='article-create-date'>{post.formattedCreatedAt}</p>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Link to={`/user/${post.userId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="user-photo-container">
                      {post.userProfilePhoto && (
                        <img src={post.userProfilePhoto} alt={`Profile for ${post.userName}`} className="user-photo" />
                      )}
                    </div>
                  </Link>
                  <p style={{ marginLeft: '10px' }}>
                    <strong><Link to={`/user/${post.userId}`}>{post.userName}</Link></strong>
                  </p>
                </div>
                <div className="post-details">
                  <p>{post.title}</p>
                  <p>{renderTextWithLinks(post.text)}</p>
                  {post.articleId ? (
                    <p><Link to={`/onearticle/${post.articleId}`}>{post.articleSubject}</Link></p>
                  ) : (
                    <p></p>
                  )}
                </div>

                <div className="mmedia-container">
                  <div className="mmedia-content">
                    {renderCurrentMedia(post.mediaContent, post.currentMediaIndex)}
                  </div>
                  {post.mediaContent.length > 1 && (
                    <div className='ppost-photos-clicks'>
                      <img src={RightClickIcon} alt="Right click icon" className="roright-click-icon" onClick={() => handleNextMedia(post.id)} />
                      <img src={LeftClickIcon} alt="Left click icon" className="roleft-click-icon" onClick={() => handlePreviousMedia(post.id)} />
                    </div>
                  )}
                </div>

                <Link to={`/onepost/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <button className="see-all-comments-button" onClick={() => handleShowComments(post.id)}></button>
                </Link>
                {post.isCommentBoxOpen && post.selectedPostComments && (
                  <div>
                    <ul>
                      {post.selectedPostComments.map((comment) => (
                        <li key={comment.id}>
                          <p><Link to={`/user/${comment.userId}`}>{comment.userName}</Link></p>
                          <p>{comment.text}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <LikeForm className='post-like-contianer' userId={post.userId} postId={post.id} liked={post.liked} />
              </div>
            </li>
          ))}
        </ul>
        {currentIndex < postIds.length && (
          <img src={ReloadIcon} alt="Load more icon" className="reload-icon" onClick={handleLoadMore} 
            title="Click For Other Posts"
          />
        )}
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

export default Post;
