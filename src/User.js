/*import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './styles/User.css';
import './styles/Profile.css';
import CommentForm from './CommentForm';
import LikeForm from './LikeForm';
import AuthService from './AuthService';
import OptionsIcon from './styles/images/profileoptions.png';
import PostOptionIcon from './styles/images/option.png';

const User = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState(null);
  const [backgroundPhotoUrl, setBackgroundPhotoUrl] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showChangePhoto, setShowChangePhoto] = useState(false);
  const navigate = useNavigate();
  const [editedUser, setEditedUser] = useState({});
  const [photoUrl, setPhotoUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userResponse = await axios.get(`http://localhost:8080/api/user/${userId}`);
        setUserData(userResponse.data);

        const userPhotoUrl = await fetchUserProfilePhoto(userId);
        setUserPhotoUrl(userPhotoUrl);

        fetchBackgroundPhoto(userId);

        const userPostsResponse = await axios.get(`http://localhost:8080/api/post/me/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const postsWithPhotos = await Promise.all(userPostsResponse.data.map(async post => {
          const { postPhotoUrl, userProfilePhoto } = await fetchPostPhoto(post.id);
          const userName = userResponse.data.username; // Kullanıcı adını al
          return { ...post, photoUrl: postPhotoUrl, userName: userName, userProfilePhoto: userProfilePhoto }; // Her bir posta kullanıcı adını ve profil fotoğrafını ekle
        }));
        setUserPosts(postsWithPhotos);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, [userId]);

  const fetchUserProfilePhoto = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/user/profile/${userId}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error('Error fetching user profile photo:', error);
      return null;
    }
  };

  const fetchBackgroundPhoto = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/user/backgrounds/${userId}`, {
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

  const fetchPostPhoto = async (postId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/post/photos/${postId}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const postPhotoUrl = URL.createObjectURL(response.data);

      // Kullanıcı profili fotoğrafını burada al
      const userProfilePhoto = await fetchUserProfilePhoto(userId);

      return { postPhotoUrl, userProfilePhoto }; // Post fotoğrafı ve kullanıcı profili fotoğrafını birlikte döndür
    } catch (error) {
      console.error('Error fetching post photo:', error);
      return null;
    }
  };

  const handleShowComments = async (postId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/comment/post/${postId}/comment`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const updatedComments = await Promise.all(response.data.map(async comment => {
        try {
          const userResponse = await axios.get(`http://localhost:8080/api/user/${comment.userId}`, {
            responseType: 'blob',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          const userProfilePhoto = await fetchUserProfilePhoto(comment.userId);
          return { ...comment, userName: userResponse.data.name, userProfilePhoto };
        } catch (error) {
          console.error('Error fetching user:', error);
          return { ...comment, userName: 'Unknown', userProfilePhoto: null };
        }
      }));
      setUserPosts(posts => posts.map(post => post.id === postId ? { ...post, selectedPostComments: updatedComments, isCommentBoxOpen: !post.isCommentBoxOpen, selectedCommentText: updatedComments.map(comment => comment.text).join('\n') } : post));
    } catch (error) {
      console.error('Error fetching comments:', error);
      setUserPosts(posts => posts.map(post => post.id === postId ? { ...post, selectedPostComments: [], isCommentBoxOpen: !post.isCommentBoxOpen, selectedCommentText: '' } : post));
    }
  };

  const handleToggleComments = (postId) => {
    setUserPosts(posts => posts.map(post => post.id === postId ? { ...post, isCommentBoxOpen: !post.isCommentBoxOpen, selectedCommentText: '' } : post));
  };

  const isAuthenticatedUser = (userId) => {
    const tokenUserId = AuthService.getUserId(); // Token'dan alınan userId'yi getir
    return userId === tokenUserId; // userId ve tokenUserId eşit mi kontrol et
  };
  const handleEditProfile = () => {
    setEditMode(!editMode);
    console.log(`Profile editing mode ${editMode ? 'disabled' : 'enabled'}`);
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
          await axios.put(`http://localhost:8080/api/user/background/${user.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${AuthService.getToken()}`
            }
          });
          // Arka plan fotoğrafını güncelledikten sonra sadece arka planı yeniden yükleme
          setBackgroundPhotoUrl(URL.createObjectURL(file)); // Arka plan fotoğrafını yenile
          fetchProfilePhoto(user.id); // Profil fotoğrafını da yenile
        }
      };
      fileInput.click();
    } catch (error) {
      console.error('Error uploading background photo:', error);
      alert('Error uploading background photo. Please try again later.');
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/user/me', {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`
          }
        });
        setUser(response.data);
        setEditedUser(response.data);
        fetchProfilePhoto(response.data.id);
        fetchBackgroundPhoto(response.data.id); // Arka plan fotoğrafını da getir
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };

    fetchUserProfile();
  }, []);

  const fetchProfilePhoto = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/user/profile/${userId}`, {
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
      console.log('Profile update request sent...');
      await axios.put(
        `http://localhost:8080/api/user/info/${user.id}`,
        { name: editedUser.name, connections: editedUser.connections, bio: editedUser.bio, gender: editedUser.gender },
        {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`
          }
        }
      );
      console.log('Profile update request successful!');
      setEditMode(false);

      // Sayfayı yenile
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
      await axios.put(`http://localhost:8080/api/user/photo/${user.id}`, formData, {
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
      const response = await axios.delete(`http://localhost:8080/api/post/${postId}`);
      if (response.status === 200) {
        // Başarılı bir şekilde silindiğinde yapılacak işlemler...
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
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
    setUserPosts(posts =>
      posts.map(post =>
        post.id === postId ? { ...post, isPanelOpen: true } : post
      )
    );
  };
  
  const handleMouseLeavePostOption = (postId) => {
    setUserPosts(posts =>
      posts.map(post =>
        post.id === postId ? { ...post, isPanelOpen: false } : post
      )
    );
  };
  
  return (
    <div className='post-container'>
      <div className='user-post-par-container'>
        {userData && (
          <div className='user-infos'>
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
            <div className="user-info">
              <div className="user-info-box">
                <p><strong>name:</strong> {userData.name}</p>
              </div>
              <div className="user-info-box">
                <p><strong>user Name:</strong> {userData.username}</p>
              </div>
              <div className="user-info-box">
                <p><strong>Bio:</strong> {userData.bio}</p>
                <p><strong>Connections:</strong> {userData.connections}</p>
              </div>
            </div>
            {backgroundPhotoUrl && (
              <div className="user-bg-photo-container">
                <img className="bg-photo" src={backgroundPhotoUrl} alt="" />
              </div>
            )}
          </div>
        )}
        {isAuthenticatedUser(userId) && ( // Kullanıcı kimlik doğrulamasını kontrol et
          <div className="options-container" onMouseEnter={() => setShowOptionsPanel(true)} onMouseLeave={() => setShowOptionsPanel(false)}>
            <img src={OptionsIcon} className="options-icon" alt="Options" onClick={() => setShowOptionsPanel(!showOptionsPanel)} />
            {showOptionsPanel && (
              <div className="options-panel">
                <button className="options-button" onClick={handleEditProfile}>Edit Profile</button>
                <button className="options-button" onClick={handleLogout}>Logout</button>
                <button className="options-button" onClick={handleChangeBackground}>Change Background</button>
              </div>
            )}
          </div>
        )}
        {editMode && (
          <div className="edit-panel">
            <input type="text" name="name" value={editedUser.name || ''} onChange={handleChange} placeholder="Name" />
            <input type="text" name="connections" value={editedUser.connections || ''} onChange={handleChange} placeholder="Connections" />
            <input type="text" name="bio" value={editedUser.bio || ''} onChange={handleChange} placeholder="Bio" />
            <select name="gender" value={editedUser.gender || ''} onChange={handleChange}>
              <option value="MAN">Man</option>
              <option value="WOMAN">Woman</option>
              <option value="OTHER">Other</option>
            </select>
            <button className="save-button" onClick={handleSaveProfile}>Save</button>
            <button className="cancel-button" onClick={handleEditProfile}>Cancel</button>
          </div>
        )}
        <div className='user-post-panel'></div>
        <ul>
        {userPosts.map(post => (
  <li key={post.id}>
    <div className="profile-ones-post-panel">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to={`/user/${userId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="user-photo-container">
            {post.userProfilePhoto ? (
              <img src={post.userProfilePhoto} alt={`Profile for ${post.userName}`} className="user-photo" />
            ) : (
              <div className="user-photo-placeholder"></div>
            )}
          </div>
        </Link>
        <p style={{ marginLeft: '10px' }}>
          <strong><Link to={`/user/${userId}`}>{post.userName}</Link></strong>
        </p>
        {isAuthenticatedUser(userId) && ( // Kullanıcı kimlik doğrulamasını kontrol et
          <img src={PostOptionIcon} className="post-option-button" alt="Options" onMouseEnter={() => handleMouseEnterPostOption(post.id)} onMouseLeave={() => handleMouseLeavePostOption(post.id)} />
        )}
      </div>
      {post.isPanelOpen && (
        <div className="post-option-panel" onMouseEnter={() => handleMouseEnterPostOption(post.id)} onMouseLeave={() => handleMouseLeavePostOption(post.id)}>
          {isAuthenticatedUser(userId) && ( // Kullanıcı kimlik doğrulamasını kontrol et
            <React.Fragment>
              <button onClick={() => handleToggleEditPanel(post.id)}>Edit Post</button>
              <button onClick={() => handleTogglePhotoEditPanel(post.id)}>Change Photo</button> {/* Yeni buton *//*}
              <button onClick={() => {
                if (window.confirm('Are you sure to delete your post?')) {
                  handleDeletePost(post.id);
                }
              }}>Delete Post</button>
            </React.Fragment>
          )}
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
    { /* <CommentForm postId={post.id} userId={post.userId} handleToggleComments={handleToggleComments} selectedCommentText={post.selectedCommentText} />*//*}
    </div>
  </li>
))}

        </ul>
      </div>
      <div className="button-container">
        <Link to="/post" className="home-button"></Link>
        <Link to={`/user/${userId}`} className="profile-button"></Link>

        <Link to="/search" className="search-button"></Link>
        <Link to="/postform" className="create-button"></Link>
      </div>
    </div>
  );
};

export default User;
*/
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './styles/User.css';
import CommentForm from './CommentForm';
import LikeForm from './LikeForm';
import AuthService from './AuthService';
import OptionsIcon from './styles/images/profileoptions.png';
import PostOptionIcon from './styles/images/option.png';

const User = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState(null);
  const [backgroundPhotoUrl, setBackgroundPhotoUrl] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  const [editedUser, setEditedUser] = useState({});
  const [photoUrl, setPhotoUrl] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userResponse = await axios.get(`http://localhost:8080/api/user/${userId}`);
        setUserData(userResponse.data);

        const userPhotoUrl = await fetchUserProfilePhoto(userId);
        setUserPhotoUrl(userPhotoUrl);

        fetchBackgroundPhoto(userId);

        const userPostsResponse = await axios.get(`http://localhost:8080/api/post/me/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const postsWithPhotos = await Promise.all(userPostsResponse.data.map(async post => {
          const { postPhotoUrl, userProfilePhoto } = await fetchPostPhoto(post.id, userId); // Pass userId
          const userName = userResponse.data.username;
          return { ...post, photoUrl: postPhotoUrl, userName: userName, userProfilePhoto: userProfilePhoto };
        }));
        
        setUserPosts(postsWithPhotos);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, [userId]);

  const fetchUserProfilePhoto = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/user/profile/${userId}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error('Error fetching user profile photo:', error);
      return null;
    }
  };

  const fetchBackgroundPhoto = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/user/backgrounds/${userId}`, {
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




  



  const fetchPostPhoto = async (postId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/post/photos/${postId}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const postPhotoUrl = URL.createObjectURL(response.data);
      return { postPhotoUrl }; // Sadece post fotoğrafını döndür
    } catch (error) {
      console.error('Error fetching post photo:', error);
      // Handle the error gracefully by returning default value
      return { postPhotoUrl: '' }; // Return default value or placeholder
    }
  };



  

  const handleShowComments = async (postId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/comment/post/${postId}/comment`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const updatedComments = await Promise.all(response.data.map(async comment => {
        try {
          const userResponse = await axios.get(`http://localhost:8080/api/user/${comment.userId}`, {
            responseType: 'blob',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          const userProfilePhoto = await fetchUserProfilePhoto(comment.userId);
          return { ...comment, userName: userResponse.data.name, userProfilePhoto };
        } catch (error) {
          console.error('Error fetching user:', error);
          return { ...comment, userName: 'Unknown', userProfilePhoto: null };
        }
      }));
      setUserPosts(posts => posts.map(post => post.id === postId ? { ...post, selectedPostComments: updatedComments, isCommentBoxOpen: !post.isCommentBoxOpen, selectedCommentText: updatedComments.map(comment => comment.text).join('\n') } : post));
    } catch (error) {
      console.error('Error fetching comments:', error);
      setUserPosts(posts => posts.map(post => post.id === postId ? { ...post, selectedPostComments: [], isCommentBoxOpen: !post.isCommentBoxOpen, selectedCommentText: '' } : post));
    }
  };
  const handleToggleEditPanel = (postId) => {
    window.location.href = `/editpost/${postId}`;
  };

  const handleTogglePhotoEditPanel = (postId) => {
    navigate(`/editPostPhoto/${postId}`); // PostPhotoEdit.js'e yönlendir
  };
  const handleToggleComments = (postId) => {
    setUserPosts(posts => posts.map(post => post.id === postId ? { ...post, isCommentBoxOpen: !post.isCommentBoxOpen, selectedCommentText: '' } : post));
  };

  const isAuthenticatedUser = (userId) => {
    const tokenUserId = AuthService.getUserId(); // Token'dan alınan userId'yi getir
    return userId === tokenUserId; // userId ve tokenUserId eşit mi kontrol et
  };
  const handleEditProfile = () => {
    setEditMode(!editMode);
    console.log(`Profile editing mode ${editMode ? 'disabled' : 'enabled'}`);
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
          await axios.put(`http://localhost:8080/api/user/background/${user.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${AuthService.getToken()}`
            }
          });
          // Arka plan fotoğrafını güncelledikten sonra sadece arka planı yeniden yükleme
          setBackgroundPhotoUrl(URL.createObjectURL(file)); // Arka plan fotoğrafını yenile
          fetchProfilePhoto(user.id); // Profil fotoğrafını da yenile
        }
      };
      fileInput.click();
    } catch (error) {
      console.error('Error uploading background photo:', error);
      alert('Error uploading background photo. Please try again later.');
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/user/me', {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`
          }
        });
        setUser(response.data);
        setEditedUser(response.data);
        fetchProfilePhoto(response.data.id);
        fetchBackgroundPhoto(response.data.id); // Arka plan fotoğrafını da getir
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };

    fetchUserProfile();
  }, []);

  const fetchProfilePhoto = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/user/profile/${userId}`, {
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
      console.log('Profile update request sent...');
      await axios.put(
        `http://localhost:8080/api/user/info/${user.id}`,
        { name: editedUser.name, connections: editedUser.connections, bio: editedUser.bio, gender: editedUser.gender },
        {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`
          }
        }
      );
      console.log('Profile update request successful!');
      setEditMode(false);

      // Sayfayı yenile
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
      await axios.put(`http://localhost:8080/api/user/photo/${user.id}`, formData, {
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
      const response = await axios.delete(`http://localhost:8080/api/post/${postId}`);
      if (response.status === 200) {
        // Başarılı bir şekilde silindiğinde yapılacak işlemler...
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };
  
  const handleMouseEnterPostOption = (postId) => {
    setUserPosts(posts =>
      posts.map(post =>
        post.id === postId ? { ...post, isPanelOpen: true } : post
      )
    );
  };
  
  const handleMouseLeavePostOption = (postId) => {
    setUserPosts(posts =>
      posts.map(post =>
        post.id === postId ? { ...post, isPanelOpen: false } : post
      )
    );
  };
  
  return (
    <div className='profile-post-container'>
      <div className='user-post-par-container'>
        {userData && (
          <div className='user-infos'>
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
            <div className="user-info">
              <div className="user-info-box">
                <p><strong>name:</strong> {userData.name}</p>
              </div>
              <div className="user-info-box">
                <p><strong>user Name:</strong> {userData.username}</p>
              </div>
              <div className="user-info-box">
                <p><strong>Bio:</strong> {userData.bio}</p>
                <p><strong>Connections:</strong> {userData.connections}</p>
              </div>
            </div>
            {backgroundPhotoUrl && (
              <div className="user-bg-photo-container">
                <img className="bg-photo" src={backgroundPhotoUrl} alt="" />
              </div>
            )}
          </div>
        )}
        {isAuthenticatedUser(userId) && ( // Kullanıcı kimlik doğrulamasını kontrol et
          <div className="options-container" onMouseEnter={() => setShowOptionsPanel(true)} onMouseLeave={() => setShowOptionsPanel(false)}>
            <img src={OptionsIcon} className="options-icon" alt="Options" onClick={() => setShowOptionsPanel(!showOptionsPanel)} />
            {showOptionsPanel && (
              <div className="options-panel">
                <button className="options-button" onClick={handleEditProfile}>Edit Profile</button>
                <button className="options-button" onClick={handleLogout}>Logout</button>
                <button className="options-button" onClick={handleChangeBackground}>Change Background</button>
              </div>
            )}
          </div>
        )}
        {editMode && (
          <div className="edit-panel">
            <input type="text" name="name" value={editedUser.name || ''} onChange={handleChange} placeholder="Name" />
            <input type="text" name="connections" value={editedUser.connections || ''} onChange={handleChange} placeholder="Connections" />
            <input type="text" name="bio" value={editedUser.bio || ''} onChange={handleChange} placeholder="Bio" />
            <select name="gender" value={editedUser.gender || ''} onChange={handleChange}>
              <option value="MAN">Man</option>
              <option value="WOMAN">Woman</option>
              <option value="OTHER">Other</option>
            </select>
            <button className="save-button" onClick={handleSaveProfile}>Save</button>
            <button className="cancel-button" onClick={handleEditProfile}>Cancel</button>
          </div>
        )}
        <div className='user-post-panel'></div>
        <ul>
        {userPosts.map(post => (
  <li key={post.id}>
    <div className="profile-ones-post-panel">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to={`/user/${userId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="user-photo-container">
            {userPhotoUrl && ( // userPhotoUrl varsa göster
              <img src={userPhotoUrl} alt={`Profile for ${post.userName}`} className="user-photo" />
            )}
          </div>
        </Link>
        <p style={{ marginLeft: '10px' }}>
          <strong><Link to={`/user/${userId}`}>{post.userName}</Link></strong>
        </p>
        {isAuthenticatedUser(userId) && (
          <img src={PostOptionIcon} className="post-option-button" alt="Options" onMouseEnter={() => handleMouseEnterPostOption(post.id)} onMouseLeave={() => handleMouseLeavePostOption(post.id)} />
        )}
      </div>
      {post.isPanelOpen && (
        <div className="post-option-panel" onMouseEnter={() => handleMouseEnterPostOption(post.id)} onMouseLeave={() => handleMouseLeavePostOption(post.id)}>
          {isAuthenticatedUser(userId) && (
            <React.Fragment>
              <button  className='post-option-panel-buttons' onClick={() => handleToggleEditPanel(post.id)}>Edit Post</button>
              {post.photoUrl && ( // Yalnızca post photo url'u varsa değişiklik yap
                <button className='post-option-panel-buttons'  onClick={() => handleTogglePhotoEditPanel(post.id)}>Change Photo</button>
              )}
              <button className='post-option-panel-buttons' onClick={() => {
                if (window.confirm('Are you sure to delete your post?')) {
                  handleDeletePost(post.id);
                }
              }}>Delete Post</button>
            </React.Fragment>
          )}
        </div>
      )}
      <div className="post-details">
        <p>{post.title}</p>
        <p>{post.text}</p>
      </div>
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
      <LikeForm userId={post.userId} postId={post.id} liked={post.liked} />
      {/* <CommentForm postId={post.id} userId={post.userId} handleToggleComments={handleToggleComments} selectedCommentText={post.selectedCommentText} /> */}
    </div>
  </li>
))}

        </ul>
      </div>
      <div className="button-container">
        <Link to="/post" className="home-button"></Link>
        <Link to={`/user/${userId}`} className="profile-button"></Link>

        <Link to="/search" className="search-button"></Link>
        <Link to="/postform" className="create-button"></Link>
      </div>
    </div>
  );
};

export default User;
