import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './styles/User.css';
import CommentForm from './CommentForm';
import LikeForm from './LikeForm';
import AuthService from './AuthService';
import OptionsIcon from './styles/images/profileoptions.png';
import PostOptionIcon from './styles/images/option.png';
import RightClickIcon from './styles/images/rightclick.png';
import LeftClickIcon from './styles/images/leftclick.png';
import PostForm from './PostForm';
import ArticleForm from './ArticleForm';
import ArticleLikeForm from './ArticleLikeForm';
const User = () => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const authenticatedUserId = AuthService.getUserId();
  const [allPhotos, setAllPhotos] = useState([]);
  const [showPosts, setShowPosts] = useState(true); 
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






  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userResponse = await axios.get(`http://localhost:8080/api/user/${userId}`);
        setUserData(userResponse.data);

        const userPhotoUrl = await fetchUserProfilePhoto(userId);
        setUserPhotoUrl(userPhotoUrl);

        fetchBackgroundPhoto(userId);

        const userPostsResponse = await axios.get(`http://localhost:8080/api/post/my/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const userArticlesResponse = await axios.get(`http://localhost:8080/api/article/my/${userId}`, {
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

        const postsWithPhotos = await Promise.all(userPostsResponse.data.map(async post => {
          const { postPhotoUrls } = await fetchPostPhoto(post.id, userId);
          const userName = userResponse.data.username;

          return { ...post, postPhotoUrls: postPhotoUrls.map(url => ({ url })), userName: userName };
        }));

        setUserPosts(postsWithPhotos);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, [userId]);


  useEffect(() => {
    if (selectedPost && selectedPost.photoUrl) {
      // selectedPost'ta photoUrl varsa, selectedFile'ı sıfırla
      setSelectedFile(null);
    }
  }, [selectedPost]);

/** */

useEffect(() => {
  if (selectedArticle && selectedArticle.photoUrl) {
    // selectedPost'ta photoUrl varsa, selectedFile'ı sıfırla
    setSelectedFile(null);
  }
}, [selectedArticle]);







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



  const fetchPostPhoto = async (postId, userId) => {
    try {
      const photoNamesResponse = await axios.get(`http://localhost:8080/api/post/photos/${postId}`);
      const photoNames = photoNamesResponse.data;

      const photoUrls = await Promise.all(photoNames.map(async photoName => {
        const photoUrlResponse = await axios.get(`http://localhost:8080/api/post/photos/${postId}/${photoName}`, {
          responseType: 'blob'
        });
        const imageUrl = URL.createObjectURL(photoUrlResponse.data);
        return imageUrl;
      }));

      console.log(`Post ID: ${postId}, Photo Count: ${photoUrls.length}`);

      // Return an object containing all photos for the post
      return { postPhotoUrls: photoUrls, currentPhotoIndex: 0 };
    } catch (error) {
      console.error('Error fetching post photo:', error);
      return { postPhotoUrls: [], currentPhotoIndex: 0 };
    }
  };
/** */
const fetchArticlePhoto = async (articleId, userId) => {
  try {
    const photoNamesResponse = await axios.get(`http://localhost:8080/api/article/photos/${articleId}`);
    const photoNames = photoNamesResponse.data;

    const photoUrls = await Promise.all(photoNames.map(async photoName => {
      const photoUrlResponse = await axios.get(`http://localhost:8080/api/article/photos/${articleId}/${photoName}`, {
        responseType: 'blob'
      });
      const imageUrl = URL.createObjectURL(photoUrlResponse.data);
      return imageUrl;
    }));

    console.log(`Article ID: ${articleId}, Photo Count: ${photoUrls.length}`);

    // Return an object containing all photos for the article
    return { articlePhotoUrls: photoUrls, currentPhotoIndex: 0 };
  } catch (error) {
    console.error('Error fetching article photo:', error);
    return { articlePhotoUrls: [], currentPhotoIndex: 0 };
  }
};





  const handleToggleEditPanel = (postId) => {
    navigate(`/postform/${postId}`);
  };
/** */

const handleToggleEditArticlePanel = (articleId) => {
  navigate(`/articleform/${articleId}`);
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


  const handleEditPost = async (postId) => {
    try {
      // Seçilen postu bulalım
      const selected = userPosts.find(post => post.id === postId);
      // Seçilen postu ayarlayalım
      setSelectedPost(selected);
      // PostForm sayfasına yönlendirelim
      if (postId) {
        // İlgili posta ait olan verileri alıp PostForm bileşenine aktar
        navigate(`/postform/${postId}`, { state: { title: selected.title, text: selected.text, photoUrl: selected.photoUrl, postId: postId } });
      } else {
        navigate(`/postform`); // Eğer postId yoksa, yeni bir post oluşturmak için yönlendirme yap
      }
    } catch (error) {
      console.error('Error editing post:', error);
      // Hata durumunda kullanıcıya bilgi verin
      // ...
    }
  };
/** */


const handleEditArticle = async (articleId) => {
  try {
    // Seçilen article bulalım
    const selected = userArticles.find(article => article.id === articleId);
    // Seçilen article ayarlayalım
    setSelectedArticle(selected);
    // articleForm sayfasına yönlendirelim
    if (articleId) {
      // İlgili article ait olan verileri alıp articleForm bileşenine aktar
      navigate(`/articleform/${articleId}`, { state: { subject: selected.subject, content: selected.content, photoUrl: selected.photoUrl, articleId: articleId } });
    } else {
      navigate(`/articleform`); // Eğer articleId yoksa, yeni bir article oluşturmak için yönlendirme yap
    }
  } catch (error) {
    console.error('Error editing article:', error);
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
/** */
const handleDeleteArticle = async (articleId) => {
  try {
    const response = await axios.delete(`http://localhost:8080/api/article/${articleId}`);
    if (response.status === 200) {
      // Başarılı bir şekilde silindiğinde yapılacak işlemler...
    }
  } catch (error) {
    console.error('Error deleting article:', error);
  }
};




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
                  responseType: 'blob' // Response tipini blob olarak ayarla, gerçek görüntü verilerini almak için
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
/** */




useEffect(() => {
  const fetchArticles = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/article/my/${userId}`);
      const articlesWithPhotos = await Promise.all(response.data.map(async article => {
        try {
          const photoNamesResponse = await axios.get(`http://localhost:8080/api/article/photos/${article.id}`);
          console.log(`GET request for photo names of article ${article.id}:`, photoNamesResponse);

          const photoNames = photoNamesResponse.data;
          const photoUrls = await Promise.all(photoNames.map(async photoName => {
            try {
              const photoUrlResponse = await axios.get(`http://localhost:8080/api/article/photos/${article.id}/${photoName}`, {
                responseType: 'blob' // Response tipini blob olarak ayarla, gerçek görüntü verilerini almak için
              });
              console.log(`GET request for photo URL of article ${article.id}, photo name ${photoName}:`, photoUrlResponse);
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
          console.error('Error fetching post photos:', error);
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
  const handleMouseEnterPost = (postId) => {
    setPosts(posts =>
      posts.map(post =>
        post.id === postId ? { ...post, isPanelOpen: true } : post
      )
    );
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

  const handleMouseLeavePostOption = (postId) => {
    setPosts(posts =>
      posts.map(post =>
        post.id === postId ? { ...post, isPanelOpen: false } : post
      )
    );
  };
/** */






const handleShowArticleComments = async (articleId) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/comment/article/${articleId}/comment`);

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

    setPosts(articles.map(article => article.id === articleId ? { ...article, selectedArticleComments: updatedComments, isCommentBoxOpen: !article.isCommentBoxOpen, selectedCommentText: updatedComments.map(comment => comment.text).join('\n') } : article));

  } catch (error) {
    console.error('Error fetching comments:', error);
    setPosts(articles.map(article => article.id === articleId ? { ...article, selectedPostComments: [], isCommentBoxOpen: !article.isCommentBoxOpen, selectedCommentText: '' } : article));
  }
};
const handleToggleArticleComments = (articleId) => {
  setArticles(articles.map(article => article.id === articleId ? { ...article, isCommentBoxOpen: !article.isCommentBoxOpen, selectedCommentText: '' } : article));
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
const handleMouseEnterArticle = (articleId) => {
  setArticles(articles =>
    articles.map(article =>
      article.id === articleId ? { ...article, isPanelOpen: true } : article
    )
  );
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

const handleMouseLeaveArticleOption = (articleId) => {
  setPosts(articles =>
    articles.map(article =>
      article.id === articleId ? { ...article, isPanelOpen: false } : article
    )
  );
};






/** */
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
            <input type="text" name="connections" value={editedUser.connections || ''} onChange={handleChange} placeholder="Connections" />
            <input type="text" name="bio" value={editedUser.bio || ''} onChange={handleChange} placeholder="Bio" />

            <button className="save-button" onClick={handleSaveProfile}>Save</button>
            <button className="cancel-button" onClick={handleEditProfile}>Cancel</button>
          </div>
        )}


    {showPosts ? (
      <div className='user-post-par-container'>
    

    <div className='user-post-panel'></div>
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
                          if (window.confirm('Are you sure to delete your post?')) {
                            handleDeletePost(post.id);
                          }
                        }}>Delete Post</button>
                      </React.Fragment>
                    )} 
                  </div>
                )}  <p className='user-create-date' style={{ marginTop: '-50px' ,marginLeft: '500px' }}>{post.formattedCreatedAt}</p>
                {!post.photoUrl && (
<div className="post-details"  style={{ marginTop: '50px' }}>

<p >{post.title}</p>
<p>{post.text}</p>
</div>
)}

                {!post.photoUrls || post.photoUrls.length === 0 ? (
                  <div className="post-details"></div>
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
    ) : (
      <div className='user-post-par-container'>
       <div className='user-post-panel'></div>
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
                          if (window.confirm('Are you sure to delete your article?')) {
                            handleDeleteArticle(article.id);
                          }
                        }}>Delete Article</button>
                      </React.Fragment>
                    )}
                  </div>
                )}  <p className='user-create-date' style={{ marginTop: '-50px' ,marginLeft: '500px' }}>{article.formattedCreatedAt}</p>
                {!article.photoUrl && (
                  <div className="post-details" style={{ marginTop: '50px' }}>
                     
                    <p>{article.subject}</p>
                    <p>{article.content}</p>
                  
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
      </div>
    )}

{/***/}











      </div>
      <div className="button-container">
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

