
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import SignupForm from './SignupForm';
import PostForm from './PostForm';
import Post from './Post';
import User from './User';
import Entry from './Entry';
import SigninForm from './SigninForm';
import  Search  from './Search';
import MyPost from './MyPost';
import OnePost from './OnePost'
import PostEdit from './PostEdit';
import PostPhotoEdit from './PostPhotoEdit';
import ForgotPassword from './ForgotPassword';


const App = () => {
  return (
    <Router>
    
      <Routes>
        <Route path="/" element={<Entry />} />
        <Route path="/signin" element={<SigninForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
      
        <Route path="/postform" element={<PostForm />} />
        <Route path="/post" element={<Post />} />
      
        <Route path="/onepost/:postId" element={<OnePost />} />
        <Route path="/editpost/:postId" element={<PostEdit />} />
        <Route path="/editpostphoto/:postId" element={<PostPhotoEdit />} />
        <Route path="/search" element={<Search />} />
        <Route path="/user/:userId" element={<User />} />
      </Routes>
    </Router>
  );
}

export default App;