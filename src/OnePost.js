 /*import React, { useState, useEffect, useRef } from 'react';
    import axios from './axios';
    import { useParams, Link } from 'react-router-dom';
    import CommentForm from './CommentForm';
    import './styles/Post.css';
    import LikeForm from './LikeForm';
    import './styles/OnePost.css';
    import AuthService from './AuthService';
    import UserCommentOptionIcon from './styles/images/option.png';

    const OnePost = () => {
        const { postId } = useParams();
        const [post, setPost] = useState(null);
        const [comments, setComments] = useState([]);
        const [showComments, setShowComments] = useState(true);
        const [user, setUser] = useState(null);
        const [userProfilePhoto, setUserProfilePhoto] = useState(null);
        const userId = AuthService.getUserId(); // Get userId from AuthService
        const [showOptionsPanel, setShowOptionsPanel] = useState(false);
        const [selectedCommentId, setSelectedCommentId] = useState(null); // Keep track of the selected comment id
        const [canReportComment, setCanReportComment] = useState(false); // Yorumu rapor edebilme durumu
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
            const fetchPost = async () => {
                try {
                    const response = await axios.get(`http://localhost:8080/api/post/${postId}`);
                    const postData = response.data;
                    if (postData) {
                        setPost(postData);
        
                        // Fetch post photo here
                        const { postPhotoUrl } = await fetchPostPhoto(postId);
                        setPost({ ...postData, photoUrl: postPhotoUrl });
                        
                        // Fetch user details and user profile photo
                        const userId = postData.user.id;
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
                    console.error('Error fetching post:', error);
                }
            };
        
            fetchPost();
        }, [postId]);
        
        
        
        const fetchPostPhoto = async (postId) => {
            try {
                const response = await axios.get(`http://localhost:8080/api/post/photos/${postId}`, {
                    responseType: 'blob',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const postPhotoUrl = URL.createObjectURL(response.data);
                console.log('Post photo fetched successfully:', postPhotoUrl); // Yeni eklenen kısım
                return { postPhotoUrl }; // Sadece post fotoğrafını döndür
            } catch (error) {
                console.error('Error fetching post photo:', error);
                // Handle the error gracefully by returning default value
                return { postPhotoUrl: '' }; // Return default value or placeholder
            }
        };
        

        const fetchComments = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/comment/post/${postId}/comment`);
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
                await axios.delete(`http://localhost:8080/api/comment/${userId}/${postId}/${commentId}`, {
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

        const handleUserCommentOptionClick = (commentId, commentUserId, postUserId) => {
            console.log("Current user ID:", userId);
            console.log("Comment user ID:", commentUserId);
            console.log("Post user ID:", postUserId);
            
            if (userId == commentUserId || userId == postUserId) {
                setShowOptionsPanel(true); // Doğru olan burası true olmalı
                setSelectedCommentId(commentId); // Seçili yorumu ayarla
                console.log("delete");
            } else {
                setShowOptionsPanel(false); // Yanlış olan burası false olmalı
                setSelectedCommentId(null); // Seçili yorumu kaldır
                console.log("report");
            }
        };

        return (
            <div>
                <div className="post-container">
                    <div className="one-post-panel">
                        {post && (
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
                                <div className="posts-details">
                                    <p>{post.title}</p>
                                    <p>{post.text}</p>
                                </div>

                                {post.photoUrl && ( // Eğer postun fotoğrafı varsa, post fotoğrafını göster
        <div className="post-photo-container">
          <img src={post.photoUrl} alt={`Photo for post ${post.id}`} className="post-photo" />
        </div>
      )}
                                <button className="see-all-comments-button" onClick={handleShowComments}></button>
                            </div>
                        )}

                        <div className="like">
                            <LikeForm postId={postId} />
                        </div>
                        <div className="comments-panel">
                            <CommentForm postId={postId} />
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
                                                onClick={() => handleUserCommentOptionClick(comment.id, comment.userId, post.user.id)}
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
                        </div>  )}
                        </div>
                
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

    export default OnePost;*/
    import React, { useState, useEffect, useRef } from 'react';
    import axios from './axios';
    import { useParams, Link } from 'react-router-dom';
    import CommentForm from './CommentForm';
    import './styles/Post.css';
    import LikeForm from './LikeForm';
    import './styles/OnePost.css';
    import AuthService from './AuthService';
    import UserCommentOptionIcon from './styles/images/option.png';

    const OnePost = () => {
        const { postId } = useParams();
        const [post, setPost] = useState(null);
        const [comments, setComments] = useState([]);
        const [showComments, setShowComments] = useState(true);
        const [user, setUser] = useState(null);
        const [userProfilePhoto, setUserProfilePhoto] = useState(null);
        const userId = AuthService.getUserId(); // Get userId from AuthService
        const [showOptionsPanel, setShowOptionsPanel] = useState(false);
        const [selectedCommentId, setSelectedCommentId] = useState(null); // Keep track of the selected comment id
        const [canReportComment, setCanReportComment] = useState(false); // Yorumu rapor edebilme durumu
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
            const fetchPost = async () => {
                try {
                    const response = await axios.get(`http://localhost:8080/api/post/${postId}`);
                    const postData = response.data;
                    if (postData) {
                        setPost(postData);
        
                        // Fetch post photo here
                        const { postPhotoUrl } = await fetchPostPhoto(postId);
                        setPost({ ...postData, photoUrl: postPhotoUrl });
                        
                        // Fetch user details and user profile photo
                        const userId = postData.user.id;
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
                    console.error('Error fetching post:', error);
                }
            };
        
            fetchPost();
        }, [postId]);
        
        
        
        const fetchPostPhoto = async (postId) => {
            try {
                const response = await axios.get(`http://localhost:8080/api/post/photos/${postId}`, {
                    responseType: 'blob',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const postPhotoUrl = URL.createObjectURL(response.data);
                console.log('Post photo fetched successfully:', postPhotoUrl); // Yeni eklenen kısım
                return { postPhotoUrl }; // Sadece post fotoğrafını döndür
            } catch (error) {
                console.error('Error fetching post photo:', error);
                // Handle the error gracefully by returning default value
                return { postPhotoUrl: '' }; // Return default value or placeholder
            }
        };
        

        const fetchComments = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/comment/post/${postId}/comment`);
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
                await axios.delete(`http://localhost:8080/api/comment/${userId}/${postId}/${commentId}`, {
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

        const handleUserCommentOptionClick = (commentId, commentUserId, postUserId) => {
            console.log("Current user ID:", userId);
            console.log("Comment user ID:", commentUserId);
            console.log("Post user ID:", postUserId);
            
            if (userId == commentUserId || userId == postUserId) {
                setShowOptionsPanel(true); // Doğru olan burası true olmalı
                setSelectedCommentId(commentId); // Seçili yorumu ayarla
                console.log("delete");
            } else {
                setShowOptionsPanel(false); // Yanlış olan burası false olmalı
                setSelectedCommentId(null); // Seçili yorumu kaldır
                console.log("report");
            }
        };

        return (
            <div>
                <div className="post-container">
                    <div className="one-post-panel">
                        {post && (
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
                                <div className="posts-details">
                                    <p>{post.title}</p>
                                    <p>{post.text}</p>
                                </div>

                                {post.photoUrl && ( // Eğer postun fotoğrafı varsa, post fotoğrafını göster
        <div className="post-photo-container">
          <img src={post.photoUrl} alt={`Photo for post ${post.id}`} className="post-photo" />
        </div>
      )}
                                <button className="see-all-comments-button" onClick={handleShowComments}></button>
                            </div>
                        )}

                        <div className="like">
                            <LikeForm postId={postId} />
                        </div>
                        <div className="comments-panel">
                            <CommentForm postId={postId} />
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
                                                onClick={() => handleUserCommentOptionClick(comment.id, comment.userId, post.user.id)}
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
                        </div>  )}
                        </div>
                
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

    export default OnePost;