import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './styles/Search.css';
import AuthService from './AuthService';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const userId = AuthService.getUserId();

  const searchPosts = async (term) => {
    const postResponse = await axios.get(`http://16.16.43.64:8080/api/post/search?keyword=${term}`, {
      headers: {
        Authorization: `Bearer ${AuthService.getToken()}`
      }
    });
    return Array.isArray(postResponse.data) ? postResponse.data : [];
  };

  const searchArticles = async (term) => {
    const articleResponse = await axios.get(`http://16.16.43.64:8080/api/article/search?keyword=${term}`, {
      headers: {
        Authorization: `Bearer ${AuthService.getToken()}`
      }
    });
    return Array.isArray(articleResponse.data) ? articleResponse.data : [];
  };

  const searchUsers = async (term) => {
    const userResponse = await axios.get(`http://16.16.43.64:8080/api/user/search?username=${term}`, {
      headers: {
        Authorization: `Bearer ${AuthService.getToken()}`
      }
    });
    return Array.isArray(userResponse.data) ? userResponse.data : [];
  };

  const handleSearchChange = async (e) => {
    const term = e.target.value.trim();
    setSearchTerm(term);

    if (term === '') {
      setResults([]);
      return;
    }

    const posts = await searchPosts(term);
    setResults(posts);
  };

  const handleTabChange = async (tab) => {
    console.log(`Tab changed to: ${tab}`);
    setActiveTab(tab);

    if (searchTerm === '') {
      setResults([]);
      return;
    }

    let data;
    if (tab === 'posts') {
      data = await searchPosts(searchTerm);
    } else if (tab === 'articles') {
      data = await searchArticles(searchTerm);
    } else if (tab === 'users') {
      data = await searchUsers(searchTerm);
    }
    setResults(data);
  };

  useEffect(() => {
    const fetchInitialResults = async () => {
      if (searchTerm !== '') {
        const posts = await searchPosts(searchTerm);
        setResults(posts);
      }
    };
    fetchInitialResults();
  }, []);

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

      <div className="tab-buttons">
        <button onClick={() => handleTabChange('posts')} className={activeTab === 'posts' ? 'active' : ''}>Posts</button>
        <button onClick={() => handleTabChange('articles')} className={activeTab === 'articles' ? 'active' : ''}>Articles</button>
        <button onClick={() => handleTabChange('users')} className={activeTab === 'users' ? 'active' : ''}>Users</button>
      </div>

      <div className='search-results-container'>
        {activeTab === 'posts' && results.length > 0 && (
          <div className='search-results'>
            <h2>Posts</h2>
            {results.map((post) => (
              <div key={post.id} className='search-result'>
                <h3>{post.title}</h3>
                <Link to={`/onepost/${post.id}`} className='read-more'>Read more</Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'articles' && results.length > 0 && (
          <div className='search-results'>
            <h2>Articles</h2>
            {results.map((article) => (
              <div key={article.id} className='search-result'>
                <h3>{article.subject}</h3>
                <Link to={`/onearticle/${article.id}`} className='read-more'>Read more</Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'users' && results.length > 0 && (
          <div className='search-results'>
            <h2>Users</h2>
            {results.map((user) => (
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
