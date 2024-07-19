import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import './styles/Follower.css';
import FollowIcon from './styles/images/ffollow.png';
import UnfollowIcon from './styles/images/funfollow.png';
import AuthService from './AuthService';

const Follower = () => {
    const { userId, viewType } = useParams();
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [currentView, setCurrentView] = useState(viewType || 'followers');
    const authenticatedUserId = AuthService.getUserId();
    const authToken = AuthService.getToken();

    useEffect(() => {
        const fetchData = async () => {
            await fetchFollowers();
            await fetchFollowing();
        };

        const fetchFollowers = async () => {
            try {
                const response = await axios.get(`http://16.16.43.64:3000/api/user/${userId}/followers`);
                const userProfiles = await Promise.all(response.data.followers.map(async (followerId) => {
                    const userResponse = await axios.get(`http://16.16.43.64:3000/api/user/${followerId}`);
                    const userPhotoUrl = await fetchUserProfilePhoto(followerId);
                    const isFollowing = await checkIsFollowing(followerId);
                    return { ...userResponse.data, userPhotoUrl, isFollowing };
                }));
                setFollowers(userProfiles);
            } catch (error) {
                console.error('Error fetching followers:', error);
            }
        };

        const fetchFollowing = async () => {
            try {
                const response = await axios.get(`http://16.16.43.64:3000/api/user/${userId}/following`);
                const userProfiles = await Promise.all(response.data.following.map(async (followingId) => {
                    const userResponse = await axios.get(`http://16.16.43.64:3000/api/user/${followingId}`);
                    const userPhotoUrl = await fetchUserProfilePhoto(followingId);
                    return { ...userResponse.data, userPhotoUrl, isFollowing: true };
                }));
                setFollowing(userProfiles);
            } catch (error) {
                console.error('Error fetching following:', error);
            }
        };

        const fetchUserProfilePhoto = async (userId) => {
            try {
                const response = await axios.get(`http://16.16.43.64:3000/api/user/profile/${userId}`, {
                    responseType: 'blob'
                });
                return URL.createObjectURL(response.data);
            } catch (error) {
                console.error('Error fetching user profile photo:', error);
                return null;
            }
        };

        const checkIsFollowing = async (followerId) => {
            try {
                const response = await axios.get(`http://16.16.43.64:3000/api/user/${authenticatedUserId}/isFollowing/${followerId}`);
                return response.data;
            } catch (error) {
                console.error('Error checking if following:', error);
                return false;
            }
        };

        fetchData();
    }, [userId, currentView]);

    const handleFollow = async (targetUserId) => {
        try {
            const url = `http://16.16.43.64:3000/api/user/${targetUserId}/follow/${authenticatedUserId}`;
            console.log('Follow URL:', url);
            await axios.post(url, {}, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });
            setFollowers(followers.map(user => user.id === targetUserId ? { ...user, isFollowing: true } : user));
            setFollowing([...following, followers.find(user => user.id === targetUserId)]);
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    const handleUnfollow = async (targetUserId) => {
        try {
            const url = `http://16.16.43.64:3000/api/user/${targetUserId}/unfollow/${authenticatedUserId}`;
            console.log('Unfollow URL:', url);
            await axios.delete(url, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });
            if (currentView === 'followers') {
                setFollowers(followers.map(user => user.id === targetUserId ? { ...user, isFollowing: false } : user));
            } else {
                setFollowing(following.filter(user => user.id !== targetUserId));
            }
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };

    const handleUnfollowFromFollowers = async (targetUserId) => {
        try {
            const url = `http://16.16.43.64:3000/api/user/${authenticatedUserId}/unfollow/${targetUserId}`;
            console.log('Unfollow from Followers URL:', url);
            await axios.delete(url, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });
            setFollowers(followers.map(user => user.id === targetUserId ? { ...user, isFollowing: false } : user));
        } catch (error) {
            console.error('Error unfollowing user from followers:', error);
        }
    };

    const renderList = (list, isFollowingList) => (
        <ul className="follower-list">
            {list.map((user) => (
                <li key={user.id} className="follower-item">
                    <Link to={`/user/${user.id}`} className="follower-link">
                        <img src={user.userPhotoUrl} alt={`${user.username}'s profile`} className="followers-profile-photo" />
                        <p className="username">{user.username}</p>
                    </Link>
                    {isFollowingList ? (
                        <img
                            src={UnfollowIcon}
                            alt="Unfollow"
                            className="follow-icon"
                            onClick={() => handleUnfollow(user.id)}
                        />
                    ) : (
                        following.find(f => f.id === user.id) ? (
                            <img
                                src={UnfollowIcon}
                                alt="Unfollow"
                                className="follow-icon"
                                onClick={() => handleUnfollowFromFollowers(user.id)}
                            />
                        ) : (
                            <img
                                src={FollowIcon}
                                alt="Follow"
                                className="follow-icon"
                                onClick={() => handleFollow(user.id)}
                            />
                        )
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <div className='profile-post-container' >
        <div className='follower-list-container'>
            <h1>{currentView === 'followers' ? 'Followers' : 'Following'}</h1>
            <div className='followers-button-container'>
                <button className='followers-button' onClick={() => setCurrentView('followers')}>
                    Followers
                </button>
                <button className='following-button' onClick={() => setCurrentView('following')}>
                    Following
                </button>
            </div>
            <div className='follower-list'>
                {currentView === 'followers' ? renderList(followers, false) : renderList(following, true)}
            </div>
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

export default Follower;
