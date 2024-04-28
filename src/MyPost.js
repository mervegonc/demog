  import React, { useState, useEffect } from 'react';
  import axios from './axios';
  import { Link, useNavigate } from 'react-router-dom'; // useNavigate ekledik
  import './styles/MyPost.css';
  import PostOptionIcon from './styles/images/option.png';
  import CommentForm from './CommentForm';
  import LikeForm from './LikeForm';

  import AuthService from './AuthService'; // Import AuthService here
  const MyPost = () => {
    const navigate = useNavigate(); // useNavigate hook'unu ekledik
    const [posts, setPosts] = useState([]);

    const [activeTab, setActiveTab] = useState('posts'); // Active tab: 'posts' or 'users'
    const userId = AuthService.getUserId(); // Get userId from AuthService
      useEffect(() => {
        const fetchPosts = async () => {
          try {
            const userId = localStorage.getItem('userId'); // localStorage'dan userId al
            const response = await axios.get(`http://localhost:8080/api/post/me/${userId}`);

            const postsWithPhotos = await Promise.all(response.data.map(async post => {
              try {
                const photoResponse = await axios.get(`http://localhost:8080/api/post/photos/${post.id}`, { responseType: 'blob' });
                const photoUrl = URL.createObjectURL(photoResponse.data);
                const userProfilePhoto = await fetchUserProfilePhoto(post.userId);
                return { ...post, photoUrl, userProfilePhoto };
              } catch (error) {
                console.error('Error fetching post photo:', error);
                return { ...post, photoUrl: null, userProfilePhoto: null };
              }
            }));
            setPosts(postsWithPhotos.map(post => ({ ...post, isCommentBoxOpen: false, selectedCommentText: '', isPanelOpen: false, isEditPanelOpen: false, editPanelPosition: null })));

          } catch (error) {
            console.error('Error fetching posts:', error);
          }
        };

        fetchPosts();
      }, []);

      const fetchUserProfilePhoto = async (userId) => {
        try {
          const userId = localStorage.getItem('userId'); // localStorage'dan userId al
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:8080/api/user/profile/${userId}`, {
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
          const response = await axios.get(`http://localhost:8080/api/comment/post/${postId}/comment`);

          const updatedComments = await Promise.all(response.data.map(async comment => {
            try {
              const userResponse = await axios.get(`http://localhost:8080/api/user/${comment.userId}`);
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

      const handleToggleComments = (postId) => {
        setPosts(posts.map(post => post.id === postId ? { ...post, isCommentBoxOpen: !post.isCommentBoxOpen, selectedCommentText: '' } : post));
      };

      const handleTogglePanel = (postId) => {
        setPosts(posts.map(post => post.id === postId ? { ...post, isPanelOpen: !post.isPanelOpen } : post));
      };

      const handleToggleEditPanel = (postId) => {
        window.location.href = `/editpost/${postId}`;
      };

      const handleTogglePhotoEditPanel = (postId) => {
        navigate(`/editPostPhoto/${postId}`); // PostPhotoEdit.js'e yönlendir
      };

      const handleMouseEnterPostOption = (postId) => {
        setPosts(posts.map(post => post.id === postId ? { ...post, isPanelOpen: true, isEditPanelOpen: post.isEditPanelOpen } : post));
      };

      const handleMouseLeavePostOption = (postId) => {
        setPosts(posts.map(post => post.id === postId ? { ...post, isPanelOpen: false } : post));
      };
      const handleDeletePost = async (postId) => {
        try {
          const response = await axios.delete(`http://localhost:8080/api/post/${postId}`);
          if (response.status === 200) {
            // Başarılı bir şekilde silindiğinde yapılacak işlemler...
          }
        } catch (error) {
          console.error('Error deleting post:', error);
        }
      };
    return (
      <div >
        <div className="post-container">
          <ul>
            {posts.map(post => (
              <li key={post.id}>
                <div className="ones-post-panel">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Link to={`/user/${post.userId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="user-photo-container">
                        {post.userProfilePhoto ? (
                          <img src={post.userProfilePhoto} alt={`Profile for ${post.userName}`} className="user-photo" />
                        ) : (
                          <div className="user-photo-placeholder"></div>
                        )}
                      </div>
                    </Link>
                    <p style={{ marginLeft: '10px' }}>
                      <strong><Link to={`/user/${post.userId}`}>{post.userName}</Link></strong>
                    </p>
                    <img src={PostOptionIcon} className="post-option-button" alt="Options" onMouseEnter={() => handleMouseEnterPostOption(post.id)} onMouseLeave={() => handleMouseLeavePostOption(post.id)} />
                  </div>
                  {post.isPanelOpen && (
                    <div className="post-option-panel" onMouseEnter={() => handleMouseEnterPostOption(post.id)} onMouseLeave={() => handleMouseLeavePostOption(post.id)}>
                      <button onClick={() => handleToggleEditPanel(post.id)}>Edit Post</button>
                      <button onClick={() => handleTogglePhotoEditPanel(post.id)}>Change Photo</button> {/* Yeni buton */}
                      <button onClick={() => handleDeletePost(post.id)}>Delete Post</button> {/* Yeni buton */}
                  
                   
                   
                    </div>
                  )}

                  <div className="post-details">
                    <p>{post.title}</p>
                    <p>{post.text}</p>
                  </div>
                  <div className="post-photo-container">
                    {post.photoUrl && (
                      <img src={post.photoUrl} alt={`Photo for post ${post.id}`} className="post-photo" />
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
                   <LikeForm userId={post.userId} postId={post.id} liked={post.liked} />
                  <CommentForm postId={post.id} userId={post.userId} handleToggleComments={handleToggleComments} selectedCommentText={post.selectedCommentText} />
                 
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="button-container">
          <Link to="/post" className="home-button"></Link>
          <Link to={`/user/${userId}`} className="profile-button"></Link>
          <Link to="/search" className="search-button"></Link>
          <Link to="/myPost" className="my-post-button"></Link>
          <Link to="/postform" className="create-button"></Link>
        </div>
      </div>
    );
  };

  export default MyPost;
