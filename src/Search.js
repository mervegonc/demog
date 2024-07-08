import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './styles/Search.css';
import AuthService from './AuthService';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [postResults, setPostResults] = useState([]);
  const [articleResults, setArticleResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const userId = AuthService.getUserId();

  const handleSearchChange = async (e) => {
    const term = e.target.value.trim();
    setSearchTerm(term);

    if (term === '') {
      setPostResults([]);
      setArticleResults([]);
      setUserResults([]);
      return;
    }

    if (activeTab === 'posts') {
      await handleSearchPosts(term);
    } else if (activeTab === 'articles') {
      await handleSearchArticles(term);
    } else if (activeTab === 'users') {
      await handleSearchUsers(term);
    }
  };

  const handleSearchPosts = async (term) => {
    try {
      const postResponse = await axios.get(`http://16.16.43.64:8080/api/post/search?keyword=${term}`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`
        }
      });
      const posts = Array.isArray(postResponse.data) ? postResponse.data : [];
      setPostResults(posts);
    } catch (error) {
      console.error('Error searching posts:', error);
      setPostResults([]);
    }
  };

  const handleSearchArticles = async (term) => {
    try {
      const articleResponse = await axios.get(`http://16.16.43.64:8080/api/article/search?keyword=${term}`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`
        }
      });
      const articles = Array.isArray(articleResponse.data) ? articleResponse.data : [];
      setArticleResults(articles);
    } catch (error) {
      console.error('Error searching articles:', error);
      setArticleResults([]);
    }
  };

  const handleSearchUsers = async (term) => {
    try {
      const userResponse = await axios.get(`http://16.16.43.64:8080/api/user/search?username=${term}`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`
        }
      });
      const users = Array.isArray(userResponse.data) ? userResponse.data : [];
      setUserResults(users);
    } catch (error) {
      console.error('Error searching users:', error);
      setUserResults([]);
    }
  };

  const handleTabChange = async (tab) => {
    console.log(`${tab} butonuna basıldı`);
    setActiveTab(tab);
    if (searchTerm.trim() !== '') {
      if (tab === 'posts') {
        await handleSearchPosts(searchTerm);
      } else if (tab === 'articles') {
        await handleSearchArticles(searchTerm);
      } else if (tab === 'users') {
        await handleSearchUsers(searchTerm);
      }
    }
  };

  return (
    <div className='search-container'>
      <form>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </form>


      <div className='search-results-container'>
        {activeTab === 'posts' && postResults.length > 0 && (
          <div className='search-results'>
            {postResults.map((post) => (
              <div key={post.id} className='search-result'>
                <h3>{post.title}</h3>
                <Link to={`/onepost/${post.id}`} className='read-more'>Read more</Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'articles' && articleResults.length > 0 && (
          <div className='search-results'>
            {articleResults.map((article) => (
              <div key={article.id} className='search-result'>
                <h3>{article.subject}</h3>
                <Link to={`/onearticle/${article.id}`} className='read-more'>Read more</Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'users' && userResults.length > 0 && (
          <div className='search-results'>
            {userResults.map((user) => (
              <div key={user.id} className='search-result'>
                <Link to={`/user/${user.id}`} className='read-more'>{user.username}</Link>
              </div>
            ))}
          </div>
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

export default Search;
