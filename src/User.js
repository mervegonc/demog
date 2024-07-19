
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './styles/User.css';
import LikeForm from './LikeForm';
import AuthService from './AuthService';
import OptionsIcon from './styles/images/profileoptions.png';
import PostOptionIcon from './styles/images/option.png';
import RightClickIcon from './styles/images/leftclick.png';
import LeftClickIcon from './styles/images/rightclick.png';
import ArticleLikeForm from './ArticleLikeForm';
import Connection from './Connection';
import UserPostIcon from './styles/images/user-post.png';
import UserArticleIcon from './styles/images/articles.png';
import Follower from './Follower';
import FollowIcon from './styles/images/unfollow.png';
import UnfollowIcon from './styles/images/follow.png';


const User = () => {
  const authenticatedUserId = AuthService.getUserId();
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState(null);
  const [backgroundPhotoUrl, setBackgroundPhotoUrl] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userArticles, setUserArticles] = useState([]);
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  const [editedUser, setEditedUser] = useState({});
  const [photoUrl, setPhotoUrl] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [posts, setPosts] = useState([]);
  const [articles, setArticles] = useState([]);
  const [showPosts, setShowPosts] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userResponse = await axios.get(`http://16.16.43.64:3000/api/user/${userId}`);

        const connectionsResponse = await axios.get(`http://16.16.43.64:3000/api/user/connections/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`
          }
        });

        setUserData({ ...userResponse.data, connections: connectionsResponse.data });

        const userPhotoUrl = await fetchUserProfilePhoto(userId);
        setUserPhotoUrl(userPhotoUrl);

        fetchBackgroundPhoto(userId);


        const followersResponse = await axios.get(`http://16.16.43.64:3000/api/user/${userId}/followers`);
        setFollowersCount(followersResponse.data.total);

        const followingResponse = await axios.get(`http://16.16.43.64:3000/api/user/${userId}/following`);
        setFollowingCount(followingResponse.data.total);

        if (userId !== authenticatedUserId) {
          const isFollowingResponse = await axios.get(`http://16.16.43.64:3000/api/user/${userId}/isFollowing/${authenticatedUserId}`, {
            headers: {
              Authorization: `Bearer ${AuthService.getToken()}`
            }
          });
          setIsFollowing(isFollowingResponse.data);
        }



        const userPostsResponse = await axios.get(`http://16.16.43.64:3000/api/post/my/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        const userArticlesResponse = await axios.get(`http://16.16.43.64:3000/api/article/my/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        const articlesWithPhotos = await Promise.all(userArticlesResponse.data.map(async article => {
          const { articlePhotoUrls } = await fetchArticlePhoto(article.id, userId);
          const userName = userResponse.data.username;
          return { ...article, articlePhotoUrls: articlePhotoUrls.map(url => ({ url })), userName: userName };
        }));

        setUserArticles(articlesWithPhotos);

        const postsWithMedia = await Promise.all(userPostsResponse.data.map(async post => {
          const { postPhotoUrls } = await fetchPostPhoto(post.id, userId);
          const { postVideoUrls } = await fetchPostVideos(post.id, userId);
          const connections = post.connections ? [{ type: 'youtube', url: post.connections }] : [];
          const userName = userResponse.data.username;
          return { ...post, mediaContent: [...postPhotoUrls, ...postVideoUrls, ...connections], userName: userName };
        }));

        setUserPosts(postsWithMedia);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, [userId]);

  const fetchBackgroundPhoto = async (userId) => {
    try {
      const response = await axios.get(`http://16.16.43.64:3000/api/user/backgrounds/${userId}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setBackgroundPhotoUrl(URL.createObjectURL(response.data));
    } catch (error) {
      console.error('Error fetching background photo:', error);
    }
  };

  const fetchPostPhoto = async (postId, userId) => {
    try {
      const photoNamesResponse = await axios.get(`http://16.16.43.64:3000/api/post/photos/${postId}`);
      const photoNames = photoNamesResponse.data;

      const photoUrls = await Promise.all(photoNames.map(async photoName => {
        const photoUrlResponse = await axios.get(`http://16.16.43.64:3000/api/post/photos/${postId}/${photoName}`, {
          responseType: 'blob'
        });
        const imageUrl = URL.createObjectURL(photoUrlResponse.data);
        return { type: 'photo', url: imageUrl };
      }));
      return { postPhotoUrls: photoUrls };
    } catch (error) {
      console.error('Error fetching post photo:', error);
      return { postPhotoUrls: [] };
    }
  };

  const fetchPostVideos = async (postId, userId) => {
    try {
      const videoNamesResponse = await axios.get(`http://16.16.43.64:3000/api/post/videos/${postId}`);
      const videoNames = videoNamesResponse.data;

      const videoUrls = await Promise.all(videoNames.map(async videoName => {
        const videoUrlResponse = await axios.get(`http://16.16.43.64:3000/api/post/videos/${postId}/${videoName}`, {
          responseType: 'blob'
        });
        const videoUrl = URL.createObjectURL(videoUrlResponse.data);
        return { type: 'video', url: videoUrl };
      }));
      return { postVideoUrls: videoUrls };
    } catch (error) {
      console.error('Error fetching post videos:', error);
      return { postVideoUrls: [] };
    }
  };

  const fetchArticlePhoto = async (articleId, userId) => {
    try {
      const photoNamesResponse = await axios.get(`http://16.16.43.64:3000/api/article/photos/${articleId}`);
      const photoNames = photoNamesResponse.data;
      const photoUrls = await Promise.all(photoNames.map(async photoName => {
        const photoUrlResponse = await axios.get(`http://16.16.43.64:3000/api/article/photos/${articleId}/${photoName}`, {
          responseType: 'blob'
        });
        const imageUrl = URL.createObjectURL(photoUrlResponse.data);
        return imageUrl;
      }));
      return { articlePhotoUrls: photoUrls };
    } catch (error) {
      console.error('Error fetching article photo:', error);
      return { articlePhotoUrls: [] };
    }
  };

  const isAuthenticatedUser = (userId) => {
    const tokenUserId = AuthService.getUserId();
    return userId === tokenUserId;
  };

  const handleEditProfile = () => {
    setEditMode(!editMode);
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  const handleChangeBackground = async () => {
    try {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          await axios.put(`http://16.16.43.64:3000/api/user/background/${user.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${AuthService.getToken()}`
            }
          });
          setBackgroundPhotoUrl(URL.createObjectURL(file));
          fetchProfilePhoto(user.id);
        }
      };
      fileInput.click();
    } catch (error) {
      console.error('Error uploading background photo:', error);
      alert('Error uploading background photo. Please try again later.');
    }
  };

  const handleEditPost = async (postId) => {
    try {
      const selected = userPosts.find(post => post.id === postId);
      setSelectedPost(selected);
      if (postId) {
        navigate(`/postform/${postId}`, { state: { title: selected.title, text: selected.text, photoUrl: selected.photoUrl, postId: postId } });
      } else {
        navigate(`/postform`);
      }
    } catch (error) {
      console.error('Error editing post:', error);
    }
  };

  const handleEditArticle = async (articleId) => {
    try {
      const selected = userArticles.find(article => article.id === articleId);
      setSelectedArticle(selected);
      if (articleId) {
        navigate(`/articleform/${articleId}`, { state: { subject: selected.subject, content: selected.content, photoUrl: selected.photoUrl, articleId: articleId } });
      } else {
        navigate(`/articleform`);
      }
    } catch (error) {
      console.error('Error editing article:', error);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('http://16.16.43.64:3000/api/user/me', {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`
          }
        });
        setUser(response.data);
        setEditedUser(response.data);
        fetchProfilePhoto(response.data.id);
        fetchBackgroundPhoto(response.data.id);
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };
    fetchUserProfile();
  }, []);

  const fetchProfilePhoto = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://16.16.43.64:3000/api/user/profile/${userId}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const imageUrl = URL.createObjectURL(response.data);
      setPhotoUrl(imageUrl);
    } catch (error) {
      console.error('Error fetching profile photo:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({
      ...editedUser,
      [name]: value
    });
  };

  const handleSaveProfile = async () => {
    try {
      await axios.put(
        `http://16.16.43.64:3000/api/user/info/${user.id}`,
        { name: editedUser.name, connections: editedUser.connections, bio: editedUser.bio, gender: editedUser.gender },
        {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`
          }
        }
      );
      setEditMode(false);
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again later.');
    }
  };

  useEffect(() => {
    if (selectedFile) {
      handleUpload();
    }
  }, [selectedFile]);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await axios.put(`http://16.16.43.64:3000/api/user/photo/${user.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${AuthService.getToken()}`
        }
      });
      setPhotoUrl(URL.createObjectURL(selectedFile));
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo. Please try again later.');
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await axios.delete(`http://16.16.43.64:3000/api/post/${postId}`);
      if (response.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleDeleteArticle = async (articleId) => {
    try {
      const response = await axios.delete(`http://16.16.43.64:3000/api/article/${articleId}`);
      if (response.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`http://16.16.43.64:3000/api/post/my/${userId}`);
        const postsWithMedia = await Promise.all(response.data.map(async post => {
          try {
            const photoNamesResponse = await axios.get(`http://16.16.43.64:3000/api/post/photos/${post.id}`);
            const photoNames = photoNamesResponse.data;
            const photoUrls = await Promise.all(photoNames.map(async photoName => {
              try {
                const photoUrlResponse = await axios.get(`http://16.16.43.64:3000/api/post/photos/${post.id}/${photoName}`, {
                  responseType: 'blob'
                });
                const imageUrl = URL.createObjectURL(photoUrlResponse.data);
                return { type: 'photo', url: imageUrl };
              } catch (error) {
                console.error('Error fetching photo URL:', error);
                return null;
              }
            }));

            const videoNamesResponse = await axios.get(`http://16.16.43.64:3000/api/post/videos/${post.id}`);
            const videoNames = videoNamesResponse.data;
            const videoUrls = await Promise.all(videoNames.map(async videoName => {
              try {
                const videoUrlResponse = await axios.get(`http://16.16.43.64:3000/api/post/videos/${post.id}/${videoName}`, {
                  responseType: 'blob'
                });
                const videoUrl = URL.createObjectURL(videoUrlResponse.data);
                return { type: 'video', url: videoUrl };
              } catch (error) {
                console.error('Error fetching video URL:', error);
                return null;
              }
            }));

            const connections = post.connections ? [{ type: 'youtube', url: post.connections }] : [];
            const userProfilePhoto = await fetchUserProfilePhoto(post.userId);
            return { ...post, mediaContent: [...photoUrls, ...videoUrls, ...connections], userProfilePhoto };
          } catch (error) {
            console.error('Error fetching post media:', error);
            const userProfilePhoto = await fetchUserProfilePhoto(post.userId);
            return { ...post, mediaContent: [], userProfilePhoto };
          }
        }));
        setPosts(postsWithMedia.map(post => ({ ...post, isCommentBoxOpen: false, selectedCommentText: '', currentMediaIndex: 0 })));
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    fetchPosts();
  }, [userId]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(`http://16.16.43.64:3000/api/article/my/${userId}`);
        const articlesWithPhotos = await Promise.all(response.data.map(async article => {
          try {
            const photoNamesResponse = await axios.get(`http://16.16.43.64:3000/api/article/photos/${article.id}`);
            const photoNames = photoNamesResponse.data;
            const photoUrls = await Promise.all(photoNames.map(async photoName => {
              try {
                const photoUrlResponse = await axios.get(`http://16.16.43.64:3000/api/article/photos/${article.id}/${photoName}`, {
                  responseType: 'blob'
                });
                const imageUrl = URL.createObjectURL(photoUrlResponse.data);
                return imageUrl;
              } catch (error) {
                console.error('Error fetching photo URL:', error);
                return null;
              }
            }));

            const userProfilePhoto = await fetchUserProfilePhoto(article.userId);
            return { ...article, photoUrls, userProfilePhoto };
          } catch (error) {
            console.error('Error fetching article photos:', error);
            const userProfilePhoto = await fetchUserProfilePhoto(article.userId);
            return { ...article, photoUrls: [], userProfilePhoto };
          }
        }));
        setArticles(articlesWithPhotos.map(article => ({ ...article, isCommentBoxOpen: false, selectedCommentText: '', currentPhotoIndex: 0 })));
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };
    fetchArticles();
  }, [userId]);

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

      const updatedComments = await Promise.all(response.data.map(async comment => {
        try {
          const userResponse = await axios.get(`http://16.16.43.64:3000/api/user/${comment.userId}`);
          const userProfilePhoto = await fetchUserProfilePhoto(comment.userId);
          return { ...comment, userName: userResponse.data.name, userProfilePhoto };
        } catch (error) {
          console.error('Error fetching user:', error);
          return { ...comment, userName: 'Unknown', userProfilePhoto: null };
        }
      }));

      setPosts(posts.map(post => post.id === postId ? { ...post, selectedPostComments: updatedComments, isCommentBoxOpen: !post.isCommentBoxOpen, selectedCommentText: updatedComments.map(comment => comment.text).join('\n') } : post));
    } catch (error) {
      console.error('Error fetching comments:', error);
      setPosts(posts.map(post => post.id === postId ? { ...post, selectedPostComments: [], isCommentBoxOpen: !post.isCommentBoxOpen, selectedCommentText: '' } : post));
    }
  };

  const handleNextMedia = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const nextMediaIndex = (post.currentMediaIndex + 1) % post.mediaContent.length;
        return { ...post, currentMediaIndex: nextMediaIndex };
      } else {
        return post;
      }
    }));
  };

  const handlePreviousMedia = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const previousMediaIndex = (post.currentMediaIndex + post.mediaContent.length - 1) % post.mediaContent.length;
        return { ...post, currentMediaIndex: previousMediaIndex };
      } else {
        return post;
      }
    }));
  };

  const handleMouseLeavePost = (postId) => {
    setPosts(posts =>
      posts.map(post =>
        post.id === postId ? { ...post, isPanelOpen: false } : post
      )
    );
  };

  const handleMouseEnterPostOption = (postId) => {
    setPosts(posts =>
      posts.map(post =>
        post.id === postId ? { ...post, isPanelOpen: true } : post
      )
    );
  };

  const handleNextArticlePhoto = (articleId) => {
    setArticles(articles.map(article => {
      if (article.id === articleId) {
        const nextPhotoIndex = (article.currentPhotoIndex + 1) % article.photoUrls.length;
        return { ...article, currentPhotoIndex: nextPhotoIndex };
      } else {
        return article;
      }
    }));
  };

  const handlePreviousArticlePhoto = (articleId) => {
    setArticles(articles.map(article => {
      if (article.id === articleId) {
        const previousPhotoIndex = (article.currentPhotoIndex + article.photoUrls.length - 1) % article.photoUrls.length;
        return { ...article, currentPhotoIndex: previousPhotoIndex };
      } else {
        return article;
      }
    }));
  };

  const handleMouseLeaveArticle = (articleId) => {
    setArticles(articles =>
      articles.map(article =>
        article.id === articleId ? { ...article, isPanelOpen: false } : article
      )
    );
  };

  const handleMouseEnterArticleOption = (articleId) => {
    setArticles(articles =>
      articles.map(article =>
        article.id === articleId ? { ...article, isPanelOpen: true } : article
      )
    );
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

  const renderContentWithLinks = (content) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return content.split(urlPattern).map((part, index) => {
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

  const renderCurrentMedia = (mediaContent, currentMediaIndex) => {
    if (mediaContent.length === 0) return null;
    const currentMedia = mediaContent[currentMediaIndex];
    if (currentMedia.type === 'photo') {
      return <img src={currentMedia.url} alt={`Content ${currentMediaIndex}`} className="post-photo" />;
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
  const handleFollow = async () => {
    try {
      await axios.post(`http://16.16.43.64:3000/api/user/${userId}/follow/${authenticatedUserId}`);
      setIsFollowing(true);
      setFollowersCount(followersCount + 1);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.delete(`http://16.16.43.64:3000/api/user/${userId}/unfollow/${authenticatedUserId}`);
      setIsFollowing(false);
      setFollowersCount(followersCount - 1);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };
  return (
    <div className='profile-post-container'>
      <div className='user-post-par-container'>
        {userData && (
          <div>
            {userPhotoUrl && (
              <div className="user-pro-photo-container">
                <img src={userPhotoUrl} alt={`${userData.name}`} className="user-pro-photo" />
                {isAuthenticatedUser(userId) && userId === AuthService.getUserId() && ( // Kullanıcı kimlik doğrulamasını ve userId'nin token'dan alınan userId'ye eşit olup olmadığını kontrol et
                  <div className="change-photo-container">
                    <label htmlFor="file-upload" className="change-photo-button">
                      <input id="file-upload" type="file" onChange={handleFileChange} style={{ display: "none" }} />
                    </label>
                  </div>
                )}
              </div>
            )}
            {backgroundPhotoUrl && (
              <div className="user-bg-photo-container">
                <img className="bg-photo" src={backgroundPhotoUrl} alt="" />
              </div>
            )}


            <div className="user-info">
              <p><strong>{userData.username}</strong></p>
              <p><strong>{userData.name}</strong></p>





              <div className='user-connections-component'>
                <p className='user-connections-component-p'>Connections</p>
                <ul className='user-info-connections'>

                  {userData.connections && userData.connections.map(connection => (
                    <li key={connection.id}>
                      <a href={connection.link} target="_blank" rel="noopener noreferrer">{connection.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className='user-followers-count'>
                <p className='followers-count'>Followers<span onClick={() => navigate(`/follower/${userId}`)}>{followersCount}</span></p>
                <p className='following-count'>Following<span onClick={() => navigate(`/follower/${userId}`)}>{followingCount}</span></p>
              </div>









              <div className='user-bio'>
                <p>{userData.bio}</p>
              </div>


              <div className='user-follow-buttons'>
                {!isAuthenticatedUser(userId) && (
                  isFollowing ? (
                    <img className='user-unfollow' src={UnfollowIcon} title="UnFollow" alt="Unfollow" onClick={handleUnfollow} style={{ cursor: 'pointer' }} />
                  ) : (
                    <img className='user-unfollow' src={FollowIcon} title="Follow" alt="Follow" onClick={handleFollow} style={{ cursor: 'pointer' }} />
                  )
                )}</div>
            </div>
          </div>
        )}
        {isAuthenticatedUser(userId) && (
          <div className="options-button-for-options" onMouseEnter={() => setShowOptionsPanel(true)} onMouseLeave={() => setShowOptionsPanel(false)}>
            <img src={OptionsIcon} className="options-icon" alt="Options" onClick={() => setShowOptionsPanel(!showOptionsPanel)} />
            {showOptionsPanel && (
              <div className="options-panel">
                <button className="options-button" onClick={handleEditProfile}>Edit Profile</button>
                <button className="options-button" onClick={handleLogout}>Logout</button>
                <button className="options-button" onClick={handleChangeBackground}>Change Backg</button>
              </div>
            )}
          </div>
        )}
        {editMode && (
          <div className="edit-panel">
            <input type="text" name="name" value={editedUser.name || ''} onChange={handleChange} placeholder="Name" />
            <textarea type="text" name="bio" value={editedUser.bio || ''} onChange={handleChange} placeholder="Bio" />
            <Connection userId={userId} />
            <button className="save-button" onClick={handleSaveProfile}>Save</button>
            <button className="cancel-button" onClick={handleEditProfile}>Cancel</button>
          </div>
        )}
        <div className="user-buttons">
          <div>
            <img
              src={UserPostIcon}
              alt="Posts"
              onClick={() => setShowPosts(true)}
              className={`user-post-buttons ${showPosts ? 'active' : ''}`}
            />
            <p className="user-post-buttons-p">Posts</p>
          </div>
          <div>
            <img
              src={UserArticleIcon}
              alt="Articles"
              onClick={() => setShowPosts(false)}
              className={`user-article-buttons ${!showPosts ? 'active' : ''}`}
            />
            <p className="user-article-buttons-p">Articles</p>
          </div>
        </div>
        {showPosts ? (
          <ul>
            {posts.map(post => (
              <li key={post.id}>
                <div className="profile-ones-post-panel">
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
                    {isAuthenticatedUser(userId) && (
                      <img src={PostOptionIcon} className="post-option-button" alt="Options" onMouseEnter={() => handleMouseEnterPostOption(post.id)} onMouseLeave={() => handleMouseLeavePost(post.id)} />
                    )}
                  </div>
                  {post.isPanelOpen && (
                    <div className="post-option-panel" onMouseEnter={() => handleMouseEnterPostOption(post.id)} onMouseLeave={() => handleMouseLeavePost(post.id)}>
                      {isAuthenticatedUser(userId) && (
                        <React.Fragment>
                          <button className='options-button' onClick={() => handleEditPost(post.id)}>Edit Post</button>
                          <button className='options-button' onClick={() => {
                            handleDeletePost(post.id);
                          }}>Delete Post</button>
                        </React.Fragment>
                      )}
                    </div>
                  )}
                  <p className='user-create-date' style={{ marginTop: '-50px', marginLeft: '500px' }}>{post.formattedCreatedAt}</p>
                  {!post.photoUrl && (
                    <div className="post-details" style={{ marginTop: '50px' }}>
                      <p>{post.title}</p>
                      <p>{renderTextWithLinks(post.text)}</p>
                      {post.articleId ? (
                        <p><Link to={`/onearticle/${post.articleId}`}>{post.articleSubject}</Link></p>
                      ) : (
                        <p></p>
                      )}
                    </div>
                  )}
                  <div className="umedia-container">
                    <div className="umedia-content">
                      {renderCurrentMedia(post.mediaContent, post.currentMediaIndex)}
                    </div>
                    {post.mediaContent.length > 1 && (
                      <div className='upost-photos-clicks'>
                        <img src={RightClickIcon} alt="Right click icon" className="uright-click-icon" onClick={() => handleNextMedia(post.id)} />
                        <img src={LeftClickIcon} alt="Left click icon" className="uleft-click-icon" onClick={() => handlePreviousMedia(post.id)} />
                      </div>
                    )}
                  </div>
                  <Link to={`/onepost/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <button className="see-all-comments-button" onClick={() => handleShowComments(post.id)}></button>
                  </Link>
                  {post.isCommentBoxOpen && post.selectedPostComments && (
                    <div>
                      <ul>
                        {post.selectedPostComments.map(comment => (
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
        ) : (
          <ul>
            {articles.map(article => (
              <li key={article.id}>
                <div className="profile-ones-post-panel">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Link to={`/user/${article.userId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="user-photo-container">
                        {article.userProfilePhoto && (
                          <img src={article.userProfilePhoto} alt={`Profile for ${article.userName}`} className="user-photo" />
                        )}
                      </div>
                    </Link>
                    <p style={{ marginLeft: '10px' }}>
                      <strong><Link to={`/user/${article.userId}`}>{article.userName}</Link></strong>
                    </p>
                    {isAuthenticatedUser(userId) && (
                      <img src={PostOptionIcon} className="post-option-button" alt="Options" onMouseEnter={() => handleMouseEnterArticleOption(article.id)} onMouseLeave={() => handleMouseLeaveArticle(article.id)} />
                    )}
                  </div>
                  {article.isPanelOpen && (
                    <div className="post-option-panel" onMouseEnter={() => handleMouseEnterArticleOption(article.id)} onMouseLeave={() => handleMouseLeaveArticle(article.id)}>
                      {isAuthenticatedUser(userId) && (
                        <React.Fragment>
                          <button className='options-button' onClick={() => handleEditArticle(article.id)}>Edit Article</button>
                          <button className='options-button' onClick={() => {
                            handleDeleteArticle(article.id);
                          }}>Delete Article</button>
                        </React.Fragment>
                      )}
                    </div>
                  )}
                  <p className='user-create-date' style={{ marginTop: '-50px', marginLeft: '500px' }}>{article.formattedCreatedAt}</p>
                  {!article.photoUrl && (
                    <div className="post-details" style={{ marginTop: '50px' }}>
                      <p>{article.subject}</p>
                      <p>{renderContentWithLinks(article.content)}</p>
                    </div>
                  )}
                  {!article.photoUrls || article.photoUrls.length === 0 ? (
                    <div className="post-details"></div>
                  ) : (
                    <div className="post-photo-container">
                      <div style={{ position: 'relative' }}>
                        <img src={article.photoUrls[article.currentPhotoIndex]} alt={`Photo for post ${article.id}`} className="post-photo" />
                        {article.photoUrls.length > 1 && (
                          <div className='post-photos-clicks'>
                            <img src={RightClickIcon} alt="Right click icon" className="right-click-icon" onClick={() => handleNextArticlePhoto(article.id)} />
                            <img src={LeftClickIcon} alt="Left click icon" className="left-click-icon" onClick={() => handlePreviousArticlePhoto(article.id)} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <Link to={`/onearticle/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <button className="see-all-comments-button" onClick={() => handleShowComments(article.id)}></button>
                  </Link>
                  {article.isCommentBoxOpen && article.selectedPostComments && (
                    <div>
                      <ul>
                        {article.selectedPostComments.map(comment => (
                          <li key={comment.id}>
                            <p><Link to={`/user/${comment.userId}`}>{comment.userName}</Link></p>
                            <p>{comment.text}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <ArticleLikeForm className='post-like-contianer' userId={article.userId} articleId={article.id} liked={article.liked} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="button-container">
        <Link to="/home" className="realhome-button"></Link>
        <Link to="/post" className="home-button"></Link>
        <Link to="/article" className="article-button"></Link>
        <Link to={`/user/${authenticatedUserId}`} className="profile-button"></Link>
        <Link to="/search" className="search-button"></Link>
        <Link to="/articleform" className="article-create-button"></Link>
        <Link to="/postform" className="create-button"></Link>
      </div>
    </div>
  );
};

export default User;
