import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthService from './AuthService';
import './styles/Home.css';
import RightClickIcon from './styles/images/leftclick.png';
import LeftClickIcon from './styles/images/rightclick.png';
import LikeForm from './LikeForm';
import ArticleLikeForm from './ArticleLikeForm';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [articles, setArticles] = useState([]);
    const authenticatedUserId = AuthService.getUserId();
    const authToken = AuthService.getToken();

    useEffect(() => {
        const fetchFollowingUsersContent = async () => {
            try {
                const followingResponse = await axios.get(`http://localhost:8080/api/user/${authenticatedUserId}/following`);
                const followingUsers = followingResponse.data.following;

                const postsPromises = followingUsers.map(async userId => {
                    const postsResponse = await axios.get(`http://localhost:8080/api/post/my/${userId}`);
                    const postsWithMedia = await Promise.all(postsResponse.data.map(async post => {
                        const photoNamesResponse = await axios.get(`http://localhost:8080/api/post/photos/${post.id}`);
                        const photoUrls = await Promise.all(photoNamesResponse.data.map(async photoName => {
                            const photoUrlResponse = await axios.get(`http://localhost:8080/api/post/photos/${post.id}/${photoName}`, {
                                responseType: 'blob'
                            });
                            const imageUrl = URL.createObjectURL(photoUrlResponse.data);
                            return { type: 'photo', url: imageUrl };
                        }));

                        const videoNamesResponse = await axios.get(`http://localhost:8080/api/post/videos/${post.id}`);
                        const videoUrls = await Promise.all(videoNamesResponse.data.map(async videoName => {
                            const videoUrlResponse = await axios.get(`http://localhost:8080/api/post/videos/${post.id}/${videoName}`, {
                                responseType: 'blob'
                            });
                            const videoUrl = URL.createObjectURL(videoUrlResponse.data);
                            return { type: 'video', url: videoUrl };
                        }));

                        const connections = post.connections ? [{ type: 'youtube', url: post.connections }] : [];

                        const userProfilePhoto = await fetchUserProfilePhoto(post.userId);
                        return { ...post, mediaContent: [...photoUrls, ...videoUrls, ...connections], userProfilePhoto, currentMediaIndex: 0 };
                    }));
                    return postsWithMedia;
                });

                const articlesPromises = followingUsers.map(async userId => {
                    const articlesResponse = await axios.get(`http://localhost:8080/api/article/my/${userId}`);
                    const articlesWithPhotos = await Promise.all(articlesResponse.data.map(async article => {
                        const photoNamesResponse = await axios.get(`http://localhost:8080/api/article/photos/${article.id}`);
                        const photoUrls = await Promise.all(photoNamesResponse.data.map(async photoName => {
                            const photoUrlResponse = await axios.get(`http://localhost:8080/api/article/photos/${article.id}/${photoName}`, {
                                responseType: 'blob'
                            });
                            const imageUrl = URL.createObjectURL(photoUrlResponse.data);
                            return imageUrl;
                        }));

                        const userProfilePhoto = await fetchUserProfilePhoto(article.userId);
                        return { ...article, photoUrls, userProfilePhoto, currentPhotoIndex: 0 };
                    }));
                    return articlesWithPhotos;
                });

                const postsResults = await Promise.all(postsPromises);
                const articlesResults = await Promise.all(articlesPromises);

                setPosts(postsResults.flat());
                setArticles(articlesResults.flat());
            } catch (error) {
                console.error('Error fetching following users content:', error);
            }
        };

        fetchFollowingUsersContent();
    }, [authenticatedUserId]);

    const fetchUserProfilePhoto = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/user/profile/${userId}`, {
                responseType: 'blob',
                headers: {
                    Authorization: `Bearer ${authToken}`
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

    const handleShowArticleComments = async (articleId) => {
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

    const renderTextWithLinks = (text) => {
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        return text.split(urlPattern).map((part, index) => {
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

    const renderCurrentMedia = (mediaContent, currentIndex) => {
        if (mediaContent.length === 0) return null;
        const currentMedia = mediaContent[currentIndex];
        if (!currentMedia || !currentMedia.type) return null;
        if (currentMedia.type === 'photo') {
            return <img src={currentMedia.url} alt={`Content ${currentIndex}`} className="post-photo" />;
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

    return (
        <div>
            <div className="profile-post-container">
                <ul>
                    {posts.map(post => (
                        <li key={post.id}>
                            <div className="ones-post-panel">
                                <p className='article-create-date'>{post.formattedCreatedAt}</p>
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
                                <div className="post-details">
                                    <p>{post.title}</p>
                                    <p>{renderTextWithLinks(post.text)}</p>
                                    {post.articleId ? (
                                        <p><Link to={`/onearticle/${post.articleId}`}>{post.articleSubject}</Link></p>
                                    ) : (
                                        <p></p>
                                    )}
                                </div>

                                {post.mediaContent && post.mediaContent.length > 0 && (
                                    <div className="mmedia-container">
                                        <div className="mmedia-content">
                                            {renderCurrentMedia(post.mediaContent, post.currentMediaIndex)}
                                        </div>
                                        {post.mediaContent.length > 1 && (
                                            <div className='ppost-photos-clicks'>
                                                <img src={RightClickIcon} alt="Right click icon" className="roright-click-icon" onClick={() => handleNextMedia(post.id)} />
                                                <img src={LeftClickIcon} alt="Left click icon" className="roleft-click-icon" onClick={() => handlePreviousMedia(post.id)} />
                                            </div>
                                        )}
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
                                <div className="post-details">
                                    <p>{article.subject}</p>
                                    <p>{renderTextWithLinks(article.content)}</p>
                                    {article.connections && (
                                        <p><a href={article.connections} target="_blank" rel="noopener noreferrer">{article.connections}</a></p>
                                    )}
                                </div>
                                {article.photoUrls && article.photoUrls.length > 0 && (
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
                                    <button className="see-all-comments-button" onClick={() => handleShowArticleComments(article.id)}></button>
                                </Link>
                                {article.isCommentBoxOpen && article.selectedArticleComments && (
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

export default Home;
