
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AuthService from './AuthService';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './styles/PostForm.css';
import FileUpload from './FileUpload';
import savePostImage from './styles/images/savepost.png';
import AddArticleLinkIcon from './styles/images/articles.png';
import AddYoutubeLinkLinkIcon from './styles/images/youtube.png';
import AddVideoIcon from './styles/images/video.png';
const PostForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    postId: null,
    createdAt: null,
    articleId: null,
    articleSubject: null,
    connections: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArticleSearch, setShowArticleSearch] = useState(false);
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const [youtubeLink, setYoutubeLink] = useState('');
  const articleSearchRef = useRef(null);
  const youtubeInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const videoInputRef = useRef(null);
  useEffect(() => {
    if (location.state) {
      const { title, text, postId, articleId, articleSubject, connections } = location.state;
      setFormData({ title, text, postId, articleId, articleSubject, connections });
    }
  }, [location]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const fetchArticles = async () => {
        try {
          const response = await axios.get(`http://16.16.43.64:3000/api/article/search?keyword=${searchTerm}&userId=${AuthService.getUserId()}`);
          if (Array.isArray(response.data)) {
            setArticles(response.data);
          } else {
            console.error('API response is not an array:', response.data);
            setArticles([]);
          }
        } catch (error) {
          console.error('Error fetching articles:', error);
          setArticles([]);
        }
      };
      
      fetchArticles();
    } else {
      setArticles([]);
    }
  }, [searchTerm]);

  const handleTitleChange = (e) => {
    const { name, value } = e.target;
    if (value.length <= 60) {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    const maxLength = 80;
    const lines = value.split('\n');
    const formattedLines = lines.map(line => {
      if (line.length > maxLength) {
        return line.match(new RegExp(`.{1,${maxLength}}`, 'g')).join('\n');
      }
      return line;
    });
    const formattedValue = formattedLines.join('\n');
    setFormData({ ...formData, [name]: formattedValue });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleArticleSelect = (articleId) => {
    setFormData({ ...formData, articleId });
    setShowArticleSearch(false);
  };

  const handleYoutubeLinkSubmit = () => {
    if (youtubeLink.trim()) {
      setFormData(prevState => ({
        ...prevState,
        connections: prevState.connections ? `${prevState.connections}, ${youtubeLink}` : youtubeLink
      }));
      setYoutubeLink('');
      setShowYoutubeModal(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.text.trim()) {
      alert('Please enter title and text');
      return;
    }

    try {
      const postData = { ...formData, userId: AuthService.getUserId() };
      if (!postData.createdAt) {
        postData.createdAt = new Date();
      }
      const config = {
        headers: { Authorization: `Bearer ${AuthService.getToken()}` }
      };

      let response;
      if (formData.postId) {
        response = await axios.put(`http://16.16.43.64:3000/api/post/${formData.postId}`, postData, config);
        alert('Updated Successfully');
        navigate(`/onepost/${formData.postId}`);
      } else {
        response = await axios.post('http://16.16.43.64:3000/api/post', postData, config);
        alert('Post created successfully');
        const newPostId = response.data.id;
        if (selectedFiles.length > 0) {
          await uploadPhotos(newPostId);
        }
        if (selectedVideo) {
          await uploadVideo(newPostId);
        }
        navigate(`/onepost/${newPostId}`);
      }

      setFormData({ title: '', text: '', createdAt: null, articleId: null, connections: '' });
      setSelectedFiles([]);
      setSelectedVideo(null);
    } catch (error) {
      console.error('Error creating or updating post:', error);
    }
  };

  const uploadPhotos = async postId => {
    const photoFormData = new FormData();
    selectedFiles.forEach(file => {
      photoFormData.append('files', file);
    });

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${AuthService.getToken()}`
      }
    };

    try {
      await axios.put(`http://16.16.43.64:3000/api/post/photos/${postId}`, photoFormData, config);
      console.log('Photos uploaded successfully!');
    } catch (error) {
      console.error('Error uploading photos:', error);
    }
  };

  const uploadVideo = async postId => {
    const videoFormData = new FormData();
    videoFormData.append('files', selectedVideo);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${AuthService.getToken()}`
      }
    };

    try {
      await axios.put(`http://16.16.43.64:3000/api/post/videos/${postId}`, videoFormData, config);
      console.log('Video uploaded successfully!');
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  const handleFileChange = files => {
    setSelectedFiles(files);
  };

 

  const handleAddArticleConnection = () => {
    setShowArticleSearch(!showArticleSearch);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (articleSearchRef.current && !articleSearchRef.current.contains(event.target)) {
        setShowArticleSearch(false);
      }
      if (youtubeInputRef.current && !youtubeInputRef.current.contains(event.target)) {
        setShowYoutubeModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddYoutubeConnection = () => {
    setShowYoutubeModal(!showYoutubeModal);
  };
  const handleAddVideoClick = () => {
    videoInputRef.current.click();
  };

  const handleVideoChange = e => {
    setSelectedVideo(e.target.files[0]);
  };
  return (
    <div className='post-form-container'>
      <div className='postform-t-t'>
      <div className='title'>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Please Write Your Post Title"
          />
        </div>
        <div className='text'>
          <textarea
            name="text"
            value={formData.text}
            onChange={handleTextChange}
            placeholder="Please Write Your Post Text"
            rows="10"
            cols="60"
          />
        </div>
        </div>



        <div className="video-upload">
        <img className="add-video-icon"
          src={AddVideoIcon}
          onClick={handleAddVideoClick}
          alt="Add Video"
          title="You can Add a Video"
          style={{ cursor: 'pointer' }}
        />
        <input 
          type="file" 
          ref={videoInputRef} 
          onChange={handleVideoChange} 
          accept="video/*" 
          style={{ display: 'none' }} 
        />
      </div>



        <div className='icon-container'>

       




        <div className='youtube-link'>
          <img className="youtube-link-add-click-icon"
            src={AddYoutubeLinkLinkIcon}
            onClick={handleAddYoutubeConnection}
            alt="Add YouTube Connection"
            title="You can Add a YouTube Connection for your Post"
            style={{ cursor: 'pointer' }}
          />
          {formData.connections && <span>(1)</span>}
          {showYoutubeModal && (
            <div className="youtube-link-modal" ref={youtubeInputRef}>
              <input
                type="text"
                placeholder="Enter YouTube Video Link"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
              />
              <button type="button" onClick={handleYoutubeLinkSubmit}>Add</button>
            </div>
          )}
        </div>

        <div className='article-search'>
          <img className="article-add-click-icon"
            src={AddArticleLinkIcon}
            onClick={handleAddArticleConnection}
            alt="Add Article Connection"
            title="You can Add An Article Connection for your Post"
            style={{ cursor: 'pointer' }}
          />

          {formData.articleId && <span>(1)</span>}
          {showArticleSearch && (
            <div className="article-search-modal" ref={articleSearchRef}>
              <input
                type="text"
                placeholder="Search for an article"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <ul className='article-results'>
                {articles.map(article => (
                  <li key={article.id}>
                    {article.subject}
                    <button type="button" onClick={() => handleArticleSelect(article.id)}>Add</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      


    
     



      <div className="postform-custom-file-upload">
        <FileUpload onFileChange={handleFileChange} />
      </div>

      <form className='post-form-area' onSubmit={handleSubmit}>
        <div>
          <img title="Save Your Post" src={savePostImage} onClick={handleSubmit} className='save-post' />
        </div>
      </form>

      
      <div className="button-container">
      <Link to="/home" className="realhome-button"></Link>
        <Link to="/post" className="home-button"></Link>
        <Link to="/article" className="article-button"></Link>
        <Link to={`/user/${AuthService.getUserId()}`} className="profile-button"></Link>
        <Link to="/search" className="search-button"></Link>
        <Link to="/articleform" className="article-create-button"></Link>
        <Link to="/postform" className="create-button"></Link>
      </div>
    </div>
  );
};

export default PostForm;