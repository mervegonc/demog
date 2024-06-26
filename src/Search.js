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
  const [activeTab, setActiveTab] = useState('posts'); // Active tab: 'posts' or 'users'
  const userId = AuthService.getUserId(); // Get userId from AuthService

  const handleSearchChange = async (e) => {
    const term = e.target.value.trim();
    setSearchTerm(term);

    if (term === '') {
      setPostResults([]);
      setArticleResults([]);
      setUserResults([]);
      return;
    }

    try {
      const postResponse = await axios.get(`http://localhost:8080/api/post/search?keyword=${term}`);
      const posts = postResponse.data;
      setPostResults(posts);

      const articleResponse = await axios.get(`http://localhost:8080/api/article/search?keyword=${term}`);
      const articles = articleResponse.data;
      setArticleResults(articles);

      const userResponse = await axios.get(`http://localhost:8080/api/user/search?username=${term}`);
      const users = userResponse.data;
      setUserResults(users);
    } catch (error) {
      console.error('Error searching posts or users:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
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

      <div className="tab-buttons">
        <div className="search-posts-button">
          <button onClick={() => handleTabChange('posts')} className={activeTab === 'posts' ? 'active' : ''}>Posts</button>
        </div>
        <div className="search-posts-button">
          <button onClick={() => handleTabChange('articles')} className={activeTab === 'articles' ? 'active' : ''}>Articles</button>
        </div>
        <div className="search-users-button">
          <button onClick={() => handleTabChange('users')} className={activeTab === 'users' ? 'active' : ''}>Users</button>
        </div>
      </div>

      <div className='search-results-container'>



        {activeTab === 'posts' && postResults.length > 0 && (
          <div className='search-results'>
            <h2>Posts</h2>
            {postResults.map((post) => (
              <div key={post.id} className='search-result'>
                <h3>{post.title}</h3>
                {/*<p>{post.text}</p>*/}
                <Link to={`/onepost/${post.id}`} className='read-more'>Read more</Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'articles' && articleResults.length > 0 && (
          <div className='search-results'>
            <h2>Articles</h2>
            {articleResults.map((article) => (
              <div key={article.id} className='search-result'>
                <h3>{article.subject}</h3>
                {/*<p>{article.content}</p>*/}
                <Link to={`/onearticle/${article.id}`} className='read-more'>Read more</Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'users' && userResults.length > 0 && (
          <div className='search-results'>
            <h2>Users</h2>
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