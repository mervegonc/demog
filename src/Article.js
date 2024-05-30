import React, { useState, useEffect } from 'react';
import axios from './axios';
import { Link } from 'react-router-dom';
import ArticleLikeForm from './ArticleLikeForm';
import './styles/Article.css';
import './styles/CommentForm.css';
import './styles/MyPost.css';
import AuthService from './AuthService'; // Import AuthService here
import RightClickIcon from './styles/images/rightclick.png';
import LeftClickIcon from './styles/images/leftclick.png';

const Article = () => {
  const [articles, setArticles] = useState([]);
  const userId = AuthService.getUserId(); // Get userId from AuthService

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/article');
        const articlesWithPhotos = await Promise.all(response.data.map(async article => {
          try {
            const photoNamesResponse = await axios.get(`http://localhost:8080/api/article/photos/${article.id}`);
            console.log(`GET request for photo names of article ${article.id}:`, photoNamesResponse);

            const photoNames = photoNamesResponse.data;
            const photoUrls = await Promise.all(photoNames.map(async photoName => {
              try {
                const photoUrlResponse = await axios.get(`http://localhost:8080/api/article/photos/${article.id}/${photoName}`, {
                  responseType: 'blob' // Set response type to blob to get the actual image data
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
            console.error('Error fetching post articles:', error);
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

  const handleShowComments = async (articleId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/articlecomment/article/${articleId}/articleComment`);

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

      setArticles(articles.map(article => article.id === articleId ? { ...article, selectedArticleComments: updatedComments, isCommentBoxOpen: !article.isCommentBoxOpen, selectedCommentText: updatedComments.map(comment => comment.text).join('\n') } : article));

    } catch (error) {
      console.error('Error fetching comments:', error);
      setArticles(articles.map(article => article.id === articleId ? { ...article, selectedArticleComments: [], isCommentBoxOpen: !article.isCommentBoxOpen, selectedCommentText: '' } : article));
    }
  };
  const handleToggleComments = (articleId) => {
    setArticles(articles.map(article => article.id === articleId ? { ...article, isCommentBoxOpen: !article.isCommentBoxOpen, selectedCommentText: '' } : article));
  };



  const handleNextPhoto = (articleId) => {
    setArticles(articles.map(article => {
      if (article.id === articleId) {
        const nextPhotoIndex = (article.currentPhotoIndex + 1) % article.photoUrls.length;
        return { ...article, currentPhotoIndex: nextPhotoIndex };
      } else {
        return article;
      }
    }));
  };

  const handlePreviousPhoto = (articleId) => {
    setArticles(articles.map(article => {
      if (article.id === articleId) {
        const previousPhotoIndex = (article.currentPhotoIndex + article.photoUrls.length - 1) % article.photoUrls.length;
        return { ...article, currentPhotoIndex: previousPhotoIndex };
      } else {
        return article;
      }
    }));
  };

  return (
    <div>
      <div className="profile-post-container">
        <ul>
          {articles.map(article => (
            <li key={article.id}>
              <div className="ones-post-panel">
                <p className='article-create-date'>{article.formattedCreatedAt}</p>
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
                </div>
                {!article.photoUrl && (
                  <div className="post-details">
                    <p>{article.subject}</p>
                    <p>{article.content}</p>

                  </div>
                )}
                {!article.photoUrls || article.photoUrls.length === 0 ? (
                  <div className="post-details">

                  </div>
                ) : (
                  <div className="post-photo-container">
                    <div style={{ position: 'relative' }}>
                      <img src={article.photoUrls[article.currentPhotoIndex]} alt={`Photo for article ${article.id}`} className="post-photo" />
                      {article.photoUrls.length > 1 && (
                        <div className='post-photos-clicks'>
                          <img src={RightClickIcon} alt="Right click icon" className="right-click-icon" onClick={() => handleNextPhoto(article.id)} />
                          <img src={LeftClickIcon} alt="Left click icon" className="left-click-icon" onClick={() => handlePreviousPhoto(article.id)} />
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
                      {article.selectedArticleComments.map(comment => (
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
      <div className="button-container">
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

export default Article;

