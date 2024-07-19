import React, { useState, useEffect, useRef } from 'react';
import axios from './axios';
import { useParams, Link } from 'react-router-dom';
import ArticleCommentForm from './ArticleCommentForm';
import './styles/Post.css';
import ArticleLikeForm from './ArticleLikeForm';
import './styles/OnePost.css';
import AuthService from './AuthService';
import UserCommentOptionIcon from './styles/images/option.png';
import LeftClickIcon from './styles/images/rightclick.png';
import RightClickIcon from './styles/images/leftclick.png';

const OneArticle = () => {
    const { articleId } = useParams();
    const [article, setArticle] = useState(null);
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(true);
    const [user, setUser] = useState(null);
    const [userProfilePhoto, setUserProfilePhoto] = useState(null);
    const userId = AuthService.getUserId();
    const [showOptionsPanel, setShowOptionsPanel] = useState(false);
    const [selectedCommentId, setSelectedCommentId] = useState(null);
    const optionsPanelRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (optionsPanelRef.current && !optionsPanelRef.current.contains(event.target)) {
                setShowOptionsPanel(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [optionsPanelRef]);

    useEffect(() => {
        const fetchArticleData = async () => {
            try {
                const articleResponse = await axios.get(`http://16.16.43.64:3000/api/article/${articleId}`);
                const articleData = articleResponse.data;
                if (articleData) {
                    const userId = articleData.userId;
                    const userResponse = await axios.get(`http://16.16.43.64:3000/api/user/${userId}`);
                    const userData = userResponse.data;
                    const userProfilePhotoResponse = await axios.get(`http://16.16.43.64:3000/api/user/profile/${userId}`, {
                        responseType: 'blob',
                        headers: {
                            Authorization: `Bearer ${AuthService.getToken()}`
                        }
                    });
                    const userProfilePhotoUrl = URL.createObjectURL(userProfilePhotoResponse.data);
                    setUser(userData);
                    setUserProfilePhoto(userProfilePhotoUrl);
                    setArticle({
                        ...articleData,
                        user: userData, // Include user data in the article object
                    });
                } else {
                    console.error('Article data is missing or incorrect.');
                }
            } catch (error) {
                console.error('Error fetching article:', error);
            }
        };

        fetchArticleData();
    }, [articleId]);

    useEffect(() => {
        const fetchArticlePhotos = async () => {
            try {
                const photoNamesResponse = await axios.get(`http://16.16.43.64:3000/api/article/photos/${articleId}`);
                const photoUrls = await Promise.all(photoNamesResponse.data.map(async photoName => {
                    try {
                        const photoUrlResponse = await axios.get(`http://16.16.43.64:3000/api/article/photos/${articleId}/${photoName}`, {
                            responseType: 'blob'
                        });
                        const imageUrl = URL.createObjectURL(photoUrlResponse.data);
                        return imageUrl;
                    } catch (error) {
                        console.error('Error fetching photo URL:', error);
                        return null;
                    }
                }));
                setArticle(prevArticle => ({
                    ...prevArticle,
                    photoUrls: photoUrls,
                    currentPhotoIndex: 0
                }));
            } catch (error) {
                console.error('Error fetching article photos:', error);
            }
        };

        fetchArticlePhotos();
    }, [articleId]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`http://16.16.43.64:3000/api/articlecomment/article/${articleId}/articleComment`);
            const updatedComments = await Promise.all(response.data.map(async comment => {
                try {
                    const userResponse = await axios.get(`http://16.16.43.64:3000/api/user/${comment.userId}`);
                    const userProfilePhotoResponse = await axios.get(`http://16.16.43.64:3000/api/user/profile/${comment.userId}`, { responseType: 'blob' });
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
            await axios.delete(`http://16.16.43.64:3000/api/articlecomment/${userId}/${articleId}/${commentId}`, {
                headers: {
                    Authorization: `Bearer ${AuthService.getToken()}`
                }
            });
            fetchComments();
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const handleUserCommentOptionClick = (commentId, commentUserId, articleUserId) => {
        console.log("Current user ID:", userId);
        console.log("Comment user ID:", commentUserId);
        console.log("Article user ID:", articleUserId);

        if (userId == commentUserId || userId == articleUserId) {
            setShowOptionsPanel(true);
            setSelectedCommentId(commentId);
            console.log("delete");
        } else {
            setShowOptionsPanel(false);
            setSelectedCommentId(null);
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

    const renderTextWithLinks = (content) => {
        if (!content) {
            return null;
        }
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        return content.split(urlPattern).map((part, index) => {
            if (urlPattern.test(part)) {
                return <a key={index} href={part} target="_blank" rel="noopener noreferrer">{part}</a>;
            }
            return part;
        });
    };

    return (
        <div>
            <div className="profile-post-container">
                <div className="one-post-panel">
                    {article && (
                        <div>
                            <div className="user-infos">
                                <p className='article-create-date'>{article.formattedCreatedAt}</p>

                                {userProfilePhoto && (
                                    <img src={userProfilePhoto} alt={`Profile photo for ${user?.username}`} className="user-photo-container" />
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
                                    <p>{renderTextWithLinks(article.content)}</p>
                                   
                                    {article.connections && (
                                        <p><a href={article.connections} target="_blank" rel="noopener noreferrer">{article.connections}</a></p>
                                    )}
                                </div>
                            )}

                            {!article.photoUrls || article.photoUrls.length === 0 ? (
                                <div className="post-details"></div>
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
                        <ArticleCommentForm articleId={articleId} onCommentSubmitted={fetchComments} />
                    </div>

                    {showComments && (
                        <div className="comment-list-panel">
                            <div className="comment-btm-panel">
                                {comments.map(comment => (
                                    <div key={comment.id} className="comment-panel">

                                        <div className='comment-option-new'>
                                            <img
                                                src={UserCommentOptionIcon}
                                                alt="Options"
                                                className="comment-option-icon"
                                                onClick={() => handleUserCommentOptionClick(comment.id, comment.userId, article.user?.id)}
                                            />
                                            {showOptionsPanel && selectedCommentId === comment.id && (
                                                <div ref={optionsPanelRef} className='user-comment-options-panel'>
                                                    <button className="comment-delete" onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                                                </div>
                                            )}
                                        </div>
                                        <p className='comment-create-date' style={{ marginTop: '17px', marginLeft: '500px' }}>{comment.formattedCreatedAt}</p>
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
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

export default OneArticle;
