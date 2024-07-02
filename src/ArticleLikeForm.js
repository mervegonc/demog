import React, { useState, useEffect } from 'react';
import axios from './axios';
import likeImage from './styles/images/unlike.png';
import unlikeImage from './styles/images/like.png';
import './styles/LikeForm.css';

const ArticleLikeForm = ({ articleId }) => {
    const [liked, setLiked] = useState(false); 
    const [likeId, setLikeId] = useState(null); 
    const [likeCount, setLikeCount] = useState(0); 
    const [userId, setUserId] = useState(null); 

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8080/api/user/me', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setUserId(response.data.id);
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        fetchUserId();
    }, []);

    useEffect(() => {
        const fetchLikeCount = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/articlelike/count/${articleId}`);
                setLikeCount(response.data); 
            } catch (error) {
                console.error('Error fetching like count:', error);
            }
        };

        fetchLikeCount();
    }, [articleId]); 

    useEffect(() => {
        const checkUserLiked = async () => {
            try {
                if (userId) {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`http://localhost:8080/api/articlelike/${articleId}/user/${userId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    if (response.data) {
                        setLiked(true);
                        setLikeId(response.data.likeId);
                    } else {
                      
                        setLiked(false);
                        setLikeId(null);
                    }
                }
            } catch (error) {
                console.error('Error checking if user liked article:', error);
            }
        };

        checkUserLiked();
    }, [articleId, userId]);

    const handleLike = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8080/api/articlelike', {
                userId: userId,
                articleId: articleId
            }, {
                headers: {
                    Authorization: `Bearer ${token}` 
                }
            });

        
            setLiked(true);
            setLikeId(response.data.id); 
            setLikeCount(likeCount + 1); 

            console.log('Article liked!');
        } catch (error) {
            console.error('Error liking article:', error); 
        }
    };

    const handleUnlike = async () => {
        try {
            const token = localStorage.getItem('token'); 
            await axios.delete(`http://localhost:8080/api/articlelike/unlike/${userId}/${articleId}`, {
                headers: {
                    Authorization: `Bearer ${token}` 
                }
            });

            setLiked(false); 
            setLikeId(null); 
            setLikeCount(likeCount - 1); 

            console.log('Article unliked!');
        } catch (error) {
            console.error('Error unliking article:', error); 
        }
    };

    return (
        <div className="like-container">
            {liked ? (
                <img src={unlikeImage} alt="Unlike" className="like-icon" onClick={handleUnlike} />
            ) : (
                <img src={likeImage} alt="Like" className="like-icon" onClick={handleLike} />
            )}
            <span className="like-count">{likeCount} likes</span>
        </div>
    );
};

export default ArticleLikeForm;
