
      
        import React, { useState, useEffect } from 'react';
        import axios from './axios';
        import { Link } from 'react-router-dom';
        import LikeForm from './LikeForm';
        import './styles/Post.css';
        import './styles/CommentForm.css';
        import './styles/MyPost.css';
        import AuthService from './AuthService'; // Import AuthService here
        import RightClickIcon from './styles/images/rightclick.png';
        import LeftClickIcon from './styles/images/leftclick.png';
        
        const Test = () => {
          const [posts, setPosts] = useState([]);
          const userId = AuthService.getUserId(); // Get userId from AuthService
        
          useEffect(() => {
            const fetchPosts = async () => {
              try {
                const response = await axios.get(`http://localhost:8080/api/post/my/${userId}`);
                const postsWithPhotos = await Promise.all(response.data.map(async post => {
                  try {
                    const photoNamesResponse = await axios.get(`http://localhost:8080/api/post/photos/${post.id}`);
                    console.log(`GET request for photo names of post ${post.id}:`, photoNamesResponse);
                    
                    const photoNames = photoNamesResponse.data;
                    const photoUrls = await Promise.all(photoNames.map(async photoName => {
                      try {
                        const photoUrlResponse = await axios.get(`http://localhost:8080/api/post/photos/${post.id}/${photoName}`, {
                          responseType: 'blob' // Set response type to blob to get the actual image data
                        });
                        console.log(`GET request for photo URL of post ${post.id}, photo name ${photoName}:`, photoUrlResponse);
                        const imageUrl = URL.createObjectURL(photoUrlResponse.data);
                        return imageUrl;
                      } catch (error) {
                        console.error('Error fetching photo URL:', error);
                        return null;
                      }
                    }));
                    
                    const userProfilePhoto = await fetchUserProfilePhoto(post.userId);
                    return { ...post, photoUrls, userProfilePhoto };
                  } catch (error) {
                    console.error('Error fetching post photos:', error);
                    const userProfilePhoto = await fetchUserProfilePhoto(post.userId);
                    return { ...post, photoUrls: [], userProfilePhoto };
                  }
                }));
                setPosts(postsWithPhotos.map(post => ({ ...post, isCommentBoxOpen: false, selectedCommentText: '', currentPhotoIndex: 0 })));
              } catch (error) {
                console.error('Error fetching posts:', error);
              }
            };
            fetchPosts();
          }, []);
          
          const fetchUserProfilePhoto = async (userId) => {
            try {
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
        
        
        
          const handleNextPhoto = (postId) => {
            setPosts(posts.map(post => {
              if (post.id === postId) {
                const nextPhotoIndex = (post.currentPhotoIndex + 1) % post.photoUrls.length;
                return { ...post, currentPhotoIndex: nextPhotoIndex };
              } else {
                return post;
              }
            }));
          };
        
          const handlePreviousPhoto = (postId) => {
            setPosts(posts.map(post => {
              if (post.id === postId) {
                const previousPhotoIndex = (post.currentPhotoIndex + post.photoUrls.length - 1) % post.photoUrls.length;
                return { ...post, currentPhotoIndex: previousPhotoIndex };
              } else {
                return post;
              }
            }));
          };
        
          return (
            <div>
              <div className="profile-post-container">
                <ul>
                  {posts.map(post => (
                    <li key={post.id}>
                      <div className="ones-post-panel">
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
                        {!post.photoUrl && (
                          <div className="post-details">
                            <p>{post.title}</p>
                            <p>{post.text}</p>
                          </div>
                        )}
                      {!post.photoUrls || post.photoUrls.length === 0 ? (
          <div className="post-details">
          
          </div>
        ) : (
          <div className="post-photo-container">
            <div style={{ position: 'relative' }}>
              <img src={post.photoUrls[post.currentPhotoIndex]} alt={`Photo for post ${post.id}`} className="post-photo" />
              {post.photoUrls.length > 1 && (
                <div className='post-photos-clicks'>
                  <img src={RightClickIcon} alt="Right click icon" className="right-click-icon" onClick={() => handleNextPhoto(post.id)} />
                  <img src={LeftClickIcon} alt="Left click icon" className="left-click-icon" onClick={() => handlePreviousPhoto(post.id)} />
                </div>
              )}
            </div>
          </div>
        )}
        
                      
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
              </div>
              <div className="button-container">
                <Link to="/post" className="home-button"></Link>
                <Link to={`/user/${userId}`} className="profile-button"></Link>
                <Link to="/search" className="search-button"></Link>
                <Link to="/articleform" className="article-create-button"></Link>
                <Link to="/postform" className="create-button"></Link>
              </div>
            </div>
          );
        };
        
        export default Test;
        
            