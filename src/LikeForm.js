import React, { useState, useEffect } from 'react';
import axios from './axios';
import likeImage from './styles/images/unlike.png';
import unlikeImage from './styles/images/like.png';
import './styles/LikeForm.css';

const LikeForm = ({ postId }) => {
    const [liked, setLiked] = useState(false); // Beğenme durumu
    const [likeId, setLikeId] = useState(null); // Beğeninin kimliği
    const [likeCount, setLikeCount] = useState(0); // Beğeni sayısı
    const [userId, setUserId] = useState(null); // Kullanıcı ID'si

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://16.16.43.64:3000/api/user/me', {
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
                const response = await axios.get(`http://16.16.43.64:3000/api/like/count/${postId}`);
                setLikeCount(response.data); // Beğeni sayısını güncelle
            } catch (error) {
                console.error('Error fetching like count:', error);
            }
        };

        fetchLikeCount();
    }, [postId]); // postId değiştiğinde yeniden çalıştır

    useEffect(() => {
        const checkUserLiked = async () => {
            try {
                if (userId) {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`http://16.16.43.64:3000/api/like/${postId}/user/${userId}`, {
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
                console.error('Error checking if user liked post:', error);
            }
        };

        checkUserLiked();
    }, [postId, userId]);

    const handleLike = async () => {
        try {
            const token = localStorage.getItem('token'); // LocalStorage'dan tokeni al
            const response = await axios.post('http://16.16.43.64:3000/api/like', {
                userId: userId, // Giriş yapmış kullanıcının userId'sini kullan
                postId: postId
            }, {
                headers: {
                    Authorization: `Bearer ${token}` // Authorization headeri ile tokeni gönder
                }
            });

            // Başarılı beğenme işlemi
            setLiked(true); // Beğenme durumunu güncelle
            setLikeId(response.data.id); // Beğeninin kimliğini sakla
            setLikeCount(likeCount + 1); // Beğeni sayısını arttır

            console.log('Post liked!');
        } catch (error) {
            console.error('Error liking post:', error); // Beğenme hatası
        }
    };

    const handleUnlike = async () => {
        try {
            const token = localStorage.getItem('token'); // LocalStorage'dan tokeni al
            await axios.delete(`http://16.16.43.64:3000/api/like/unlike/${userId}/${postId}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Authorization headeri ile tokeni gönder
                }
            });

            // Başarılı beğenmeme işlemi
            setLiked(false); // Beğenme durumunu güncelle
            setLikeId(null); // Beğeninin kimliğini kaldır
            setLikeCount(likeCount - 1); // Beğeni sayısını azalt

            console.log('Post unliked!');
        } catch (error) {
            console.error('Error unliking post:', error); // Beğenmeme hatası
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

export default LikeForm;
