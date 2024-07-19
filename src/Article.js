import React, { useState, useEffect } from 'react';
import axios from './axios';
import { Link } from 'react-router-dom';
import ArticleLikeForm from './ArticleLikeForm';
import './styles/Article.css';
import './styles/CommentForm.css';
import './styles/MyPost.css';
import AuthService from './AuthService';
import RightClickIcon from './styles/images/leftclick.png';
import LeftClickIcon from './styles/images/rightclick.png';
import ReloadIcon from './styles/images/reloadicon.png';

const Article = () => {
  const [articles, setArticles] = useState([]);
  const [articleIds, setArticleIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const userId = AuthService.getUserId();

  useEffect(() => {
    const fetchArticleIds = async () => {
      try {
        const response = await axios.get('http://16.16.43.64:8080/api/article/allArticlesIds');
        const sortedArticleIds = response.data.sort((a, b) => b - a);
        setArticleIds(sortedArticleIds);
      } catch (error) {
        console.error('Error fetching article IDs:', error);
      }
    };
    fetchArticleIds();
  }, []);

  useEffect(() => {
    if (articleIds.length > 0 && currentIndex === 0) {
      fetchArticle(articleIds[0]);
      setCurrentIndex(1);
    }
  }, [articleIds]);

  const fetchArticle = async (articleId) => {
    try {
      const response = await axios.get(`http://16.16.43.64:8080/api/article/${articleId}`);
      const article = response.data;

      const photoNamesResponse = await axios.get(`http://16.16.43.64:8080/api/article/photos/${article.id}`);
      const photoNames = photoNamesResponse.data;
      const photoUrls = await Promise.all(photoNames.map(async (photoName) => {
        const photoUrlResponse = await axios.get(`http://16.16.43.64:8080/api/article/photos/${article.id}/${photoName}`, {
          responseType: 'blob'
        });
        const imageUrl = URL.createObjectURL(photoUrlResponse.data);
        return imageUrl;
      }));

      const userProfilePhoto = await fetchUserProfilePhoto(article.userId);

      const newArticle = {
        ...article,
        photoUrls,
        userProfilePhoto,
        isCommentBoxOpen: false,
        selectedCommentText: '',
        currentPhotoIndex: 0
      };

      setArticles((prevArticles) => [...prevArticles, newArticle]);
    } catch (error) {
      console.error('Error fetching article:', error);
    }
  };

  const fetchUserProfilePhoto = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://16.16.43.64:8080/api/user/profile/${userId}`, {
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
      const response = await axios.get(`http://16.16.43.64:8080/api/articlecomment/article/${articleId}/articleComment`);
      const updatedComments = await Promise.all(response.data.map(async (comment) => {
        const userResponse = await axios.get(`http://16.16.43.64:8080/api/user/${comment.userId}`);
        const userProfilePhoto = await fetchUserProfilePhoto(comment.userId);
        return { ...comment, userName: userResponse.data.name, userProfilePhoto };
      }));
      setArticles((prevArticles) => prevArticles.map((article) => article.id === articleId ? {
        ...article,
        selectedArticleComments: updatedComments,
        isCommentBoxOpen: !article.isCommentBoxOpen,
        selectedCommentText: updatedComments.map(comment => comment.text).join('\n')
      } : article));
    } catch (error) {
      console.error('Error fetching comments:', error);
      setArticles((prevArticles) => prevArticles.map((article) => article.id === articleId ? {
        ...article,
        selectedArticleComments: [],
        isCommentBoxOpen: !article.isCommentBoxOpen,
        selectedCommentText: ''
      } : article));
    }
  };

  const handleNextPhoto = (articleId) => {
    setArticles((prevArticles) => prevArticles.map((article) => article.id === articleId ? {
      ...article,
      currentPhotoIndex: (article.currentPhotoIndex + 1) % article.photoUrls.length
    } : article));
  };

  const handlePreviousPhoto = (articleId) => {
    setArticles((prevArticles) => prevArticles.map((article) => article.id === articleId ? {
      ...article,
      currentPhotoIndex: (article.currentPhotoIndex + article.photoUrls.length - 1) % article.photoUrls.length
    } : article));
  };

  const renderTextWithLinks = (content) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return content.split(urlPattern).map((part, index) => {
      if (urlPattern.test(part)) {
        return <a key={index} href={part} target="_blank" rel="noopener noreferrer">{part}</a>;
      }
      return part;
    });
  };

  const handleLoadMore = () => {
    if (currentIndex < articleIds.length) {
      fetchArticle(articleIds[currentIndex]);
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div>
      <div className="profile-post-container">
        <ul>
          {articles.map((article) => (
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
                <div className="post-details">
                  <p>{article.subject}</p>
                  <p>{renderTextWithLinks(article.content)}</p>
                  {article.connections && (
                    <p><a href={article.connections} target="_blank" rel="noopener noreferrer">{article.connections}</a></p>
                  )}
                </div>

                {!article.photoUrls || article.photoUrls.length === 0 ? null : (
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
                {article.isCommentBoxOpen && article.selectedArticleComments && (
                  <div>
                    <ul>
                      {article.selectedArticleComments.map((comment) => (
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
        {currentIndex < articleIds.length && (
          <img src={ReloadIcon} alt="Load more icon" className="reload-icon" onClick={handleLoadMore} title="Click For Other Articles" />
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

export default Article;
