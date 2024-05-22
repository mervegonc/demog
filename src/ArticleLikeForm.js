import React, { useState, useEffect } from 'react';
import axios from './axios';
import likeImage from './styles/images/unlike.png';
import unlikeImage from './styles/images/like.png';
import './styles/LikeForm.css';
import AuthService from './AuthService';

const ArticleLikeForm = ({ articleId }) => {
    const [liked, setLiked] = useState(false); // Beğenme durumu
    const [likeId, setLikeId] = useState(null); // Beğeninin kimliği
    const [likeCount, setLikeCount] = useState(0); // Beğeni sayısı
    const [userId, setUserId] = useState(null); // Kullanıcı ID'si

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
                setLikeCount(response.data); // Beğeni sayısını güncelle
            } catch (error) {
                console.error('Error fetching like count:', error);
            }
        };

        fetchLikeCount();
    }, [articleId]); // articleId değiştiğinde yeniden çalıştır

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

                    // Kullanıcı daha önce like atmışsa, like butonunu gizle
                    if (response.data) {
                        setLiked(true);
                        setLikeId(response.data.likeId);
                    } else {
                        // Kullanıcı daha önce like atmamışsa, like butonunu göster
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
            const token = localStorage.getItem('token'); // LocalStorage'dan tokeni al
            const response = await axios.post('http://localhost:8080/api/articlelike', {
                userId: userId, // Giriş yapmış kullanıcının userId'sini kullan
                articleId: articleId
            }, {
                headers: {
                    Authorization: `Bearer ${token}` // Authorization headeri ile tokeni gönder
                }
            });

            // Başarılı beğenme işlemi
            setLiked(true); // Beğenme durumunu güncelle
            setLikeId(response.data.id); // Beğeninin kimliğini sakla
            setLikeCount(likeCount + 1); // Beğeni sayısını arttır

            console.log('Article liked!');
        } catch (error) {
            console.error('Error liking article:', error); // Beğenme hatası
        }
    };

    const handleUnlike = async () => {
        try {
            const token = localStorage.getItem('token'); // LocalStorage'dan tokeni al
            await axios.delete(`http://localhost:8080/api/articlelike/unlike/${userId}/${articleId}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Authorization headeri ile tokeni gönder
                }
            });

            // Başarılı beğenmeme işlemi
            setLiked(false); // Beğenme durumunu güncelle
            setLikeId(null); // Beğeninin kimliğini kaldır
            setLikeCount(likeCount - 1); // Beğeni sayısını azalt

            console.log('Article unliked!');
        } catch (error) {
            console.error('Error unliking article:', error); // Beğenmeme hatası
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
