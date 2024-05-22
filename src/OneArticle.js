import React, { useState, useEffect, useRef } from 'react';
import axios from './axios';
import { useParams, Link } from 'react-router-dom';
import ArticleCommentForm from './ArticleCommentForm';
import './styles/Post.css';
import ArticleLikeForm from './ArticleLikeForm';
import './styles/OnePost.css';
import AuthService from './AuthService';
import UserCommentOptionIcon from './styles/images/option.png';
import RightClickIcon from './styles/images/rightclick.png';
import LeftClickIcon from './styles/images/leftclick.png';

const OneArticle = () => {
    const { articleId } = useParams();
    const [article, setArticle] = useState(null);
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(true);
    const [user, setUser] = useState(null);
    const [userProfilePhoto, setUserProfilePhoto] = useState(null);
    const userId = AuthService.getUserId(); // Get userId from AuthService
    const [showOptionsPanel, setShowOptionsPanel] = useState(false);
    const [selectedCommentId, setSelectedCommentId] = useState(null); // Keep track of the selected comment id
    const optionsPanelRef = useRef(null); // Ref for options panel

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click is outside the options panel
            if (optionsPanelRef.current && !optionsPanelRef.current.contains(event.target)) {
                setShowOptionsPanel(false); // Close the options panel
            }
        };

        // Add event listener when component mounts
        document.addEventListener("mousedown", handleClickOutside);

        // Cleanup by removing the event listener when component unmounts
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [optionsPanelRef]);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/article/${articleId}`);
                const articleData = response.data;
                console.log('articleData:', articleData); // Add this line to check the structure of articleData
                if (articleData) {
                    setArticle(articleData);
    
                    // Fetch user details and user profile photo
                    const userId = articleData.user.id; // This line likely causes the error
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
                } else {
                    console.error('Post data is missing or incorrect.');
                }
            } catch (error) {
                console.error('Error fetching article:', error);
            }
        };
    
        fetchArticle();
    }, [articleId]);
    

    
    useEffect(() => {
        const fetchArticlePhotos = async () => {
          try {
            // İlk olarak, belirli bir articleId'ye ait fotoğraf isimlerini almak için GET isteği yapın
            const photoNamesResponse = await axios.get(`http://localhost:8080/api/article/photos/${articleId}`);
            
            // Fotoğraf isimlerini aldıktan sonra, her bir isim için ayrı bir GET isteği yaparak fotoğraf URL'lerini alın
            const photoUrls = await Promise.all(photoNamesResponse.data.map(async photoName => {
              try {
                const photoUrlResponse = await axios.get(`http://localhost:8080/api/article/photos/${articleId}/${photoName}`, {
                  responseType: 'blob' // Görüntü verilerini almak için blob türünde yanıt bekleyin
                });
                const imageUrl = URL.createObjectURL(photoUrlResponse.data);
                return imageUrl;
              } catch (error) {
                console.error('Error fetching photo URL:', error);
                return null;
              }
            }));
      
            // Aldığınız fotoğraf URL'lerini Article nesnesine ekleyin
            setArticle(prevArticle => ({
              ...prevArticle,
              photoUrls: photoUrls,
              currentPhotoIndex: 0 // Default current photo index
            }));
          } catch (error) {
            console.error('Error fetching article photos:', error);
          }
        };
      
        fetchArticlePhotos();
      }, [articleId]);
      

    const fetchComments = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/articlecomment/article/${articleId}/articleComment`);
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
            // Yorumu silmek için HTTP DELETE isteği gönder
            await axios.delete(`http://localhost:8080/api/comment/${userId}/${articleId}/${commentId}`, {
                headers: {
                    Authorization: `Bearer ${AuthService.getToken()}`
                }
            });

            // Silme işlemi başarılıysa yorum listesini güncelle
            fetchComments();
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const handleUserCommentOptionClick = (commentId, commentUserId, articleUserId) => {
        console.log("Current user ID:", userId);
        console.log("Comment user ID:", commentUserId);
        console.log("Post user ID:", articleUserId);

        if (userId == commentUserId || userId == articleUserId) {
            setShowOptionsPanel(true); // Doğru olan burası true olmalı
            setSelectedCommentId(commentId); // Seçili yorumu ayarla
            console.log("delete");
        } else {
            setShowOptionsPanel(false); // Yanlış olan burası false olmalı
            setSelectedCommentId(null); // Seçili yorumu kaldır
            console.log("report");
        }
    };

    const handleNextPhoto = () => {
        setArticle(prevArticle => {
            const nextPhotoIndex = (prevArticle.currentPhotoIndex + 1) % prevArticle.photoUrls.length;
            return { ...prevArticle, currentPhotoIndex: nextPhotoIndex };
        });
    };

    const handlePreviousPhoto = () => {
        setArticle(prevArticle => {
            const previousPhotoIndex = (prevArticle.currentPhotoIndex + prevArticle.photoUrls.length - 1) % prevArticle.photoUrls.length;
            return { ...prevArticle, currentPhotoIndex: previousPhotoIndex };
        });
    };
    
    return (
        <div>
            <div className="post-container">
                <div className="one-post-panel">
                    {article && (
                        <div>
                            <div className="user-infos">
                                {userProfilePhoto && (
                                    <img src={userProfilePhoto} alt={`Profile photo for ${user.username}`} className="user-photo-container" />
                                )}
                                <div className="user-name">
                                    {user && (
                                        <p> <Link to={`/user/${user.id}`}>{user.username}</Link></p>
                                    )}
                                </div>
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
                                                <img src={RightClickIcon} alt="Right click icon" className="right-click-icon" onClick={handleNextPhoto} />
                                                <img src={LeftClickIcon} alt="Left click icon" className="left-click-icon" onClick={handlePreviousPhoto} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

<button className="see-all-comments-button" onClick={handleShowComments}></button>
                        </div>
                    )}

                    <div className="like">
                        <ArticleLikeForm articleId={articleId} />
                    </div>
                    <div className="comments-panel">
                        <ArticleCommentForm articleId={articleId} />
                    </div>
                    {showComments && (
                        <div className="comment-list-panel">
                            <div  className="comment-btm-panel">
                                {comments.map(comment => (
                                    <div key={comment.id} className="comment-panel">
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

                                            <img
                                                src={UserCommentOptionIcon}
                                                alt="Options"
                                                className="comment-option-icon"
                                                onClick={() => handleUserCommentOptionClick(comment.id, comment.userId, article.user.id)}
                                            />

                                            {showOptionsPanel && selectedCommentId == comment.id && (
                                                <div ref={optionsPanelRef} className='user-comment-options-panel'>
                                                    <button className="comment-delete" onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

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

export default OneArticle;