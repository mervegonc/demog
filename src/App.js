import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupForm from './SignupForm';
import PostForm from './PostForm';
import Post from './Post';
import User from './User';
import Entry from './Entry';
import SigninForm from './SigninForm';
import  Search  from './Search';
import OnePost from './OnePost'
import ForgotPassword from './ForgotPassword';
import Article from './Article';
import OneArticle from './OneArticle';
import ArticleForm from './ArticleForm';
import Follower from './Follower';
import Home from './Home';


const App = () => {
  return (
    <Router>
    
      <Routes>
        <Route path="/" element={<Entry />} />
        <Route path="/signin" element={<SigninForm />} />
        <Route path="/follower/:userId" element={<Follower />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/postform/:postId" element={<PostForm />} />
        <Route path="/articleform/:articleId" element={<ArticleForm />} />
        <Route path="/articleform" element={<ArticleForm />} />
        <Route path="/postform" element={<PostForm />} />
        <Route path="/post" element={<Post />} />
        <Route path="/article" element={<Article />} />
        <Route path="/onearticle/:articleId" element={<OneArticle />} />
        <Route path="/onepost/:postId" element={<OnePost />} />
         <Route path="/search" element={<Search />} />
        <Route path="/user/:userId" element={<User />} />
      </Routes>
    </Router>
  );
}

export default App;