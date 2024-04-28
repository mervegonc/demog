    import React, { useState, useEffect } from 'react';
    import axios from './axios';
    import { Link } from 'react-router-dom';
    import LikeForm from './LikeForm';
    import './styles/Post.css';
    import './styles/CommentForm.css'
    import './styles/MyPost.css'
    import AuthService from './AuthService'; // Import AuthService here
    const Post = () => {
      const [posts, setPosts] = useState([]);
      const [activeTab, setActiveTab] = useState('posts'); // Active tab: 'posts' or 'users'
      const userId = AuthService.getUserId(); // Get userId from AuthService
      useEffect(() => {
        const fetchPosts = async () => {
          try {
            const response = await axios.get('http://localhost:8080/api/post');
            const postsWithPhotos = await Promise.all(response.data.map(async post => {
              try {
                  const photoResponse = await axios.get(`http://localhost:8080/api/post/photos/${post.id}`, { responseType: 'blob' });
                  const photoUrl = URL.createObjectURL(photoResponse.data);
                  const userProfilePhoto = await fetchUserProfilePhoto(post.userId);
                  return { ...post, photoUrl, userProfilePhoto };
              } catch (error) {
                  console.error('Error fetching post photo:', error);
                  // Eğer postun fotoğrafı yoksa, yine de kullanıcının profil fotoğrafını al
                  const userProfilePhoto = await fetchUserProfilePhoto(post.userId);
                  return { ...post, photoUrl: null, userProfilePhoto };
              }
          }));
          
            setPosts(postsWithPhotos.map(post => ({ ...post, isCommentBoxOpen: false, selectedCommentText: '' })));
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

      // Post componentinin içindeki return bloğu
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
      {post.photoUrl && ( // Eğer postun fotoğrafı yoksa, post detaylarını göster
        <div className="post-details">
          <p>{post.title}</p>
          <p>{post.text}</p>
        </div>
      )}
      {post.photoUrl && ( // Eğer postun fotoğrafı varsa, post fotoğrafını göster
        <div className="post-photo-container">
          <img src={post.photoUrl} alt={`Photo for post ${post.id}`} className="post-photo" />
        </div>
      )}
      
      {!post.photoUrl && ( // Eğer postun fotoğrafı yoksa, post detaylarını göster
        <div className="post-details">
          <p>{post.title}</p>
          <p>{post.text}</p>
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


           {/* {posts.map(post => (
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
  </div>
  {!post.photoUrl && (
    <div className="post-details">
      <p>{post.title}</p>
      <p>{post.text}</p>
    </div>
  )}
  {post.photoUrl && (
    <div className="post-photo-container">
      <img src={post.photoUrl} alt={`Photo for post ${post.id}`} className="post-photo" />
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
            ))} */}  
          </ul>
        </div>
        <div className="button-container">

          <Link to="/post" className="home-button"></Link>
          <Link to={`/user/${userId}`} className="profile-button"></Link>
            <Link to="/search" className="search-button"></Link>
           {/*<Link to="/myPost" className="my-post-button"></Link>*/}
            <Link to="/postform" className="create-button"></Link>
        </div>
      </div>
    );

    };

    export default Post;