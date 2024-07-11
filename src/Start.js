import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Start.css';
import SignupImage from './styles/images/how/2.png';
import SigninImage from './styles/images/how/1.png';
import ChangePasswordImage from './styles/images/how/3.png';
import UserScreenImage1 from './styles/images/how/4.png';
import UserScreenImage2 from './styles/images/how/5.png';
import UserScreenImage3 from './styles/images/how/6.png';
import EditUserScreenImage from './styles/images/how/11.png';
import EditPostOrArticleImage from './styles/images/how/12.png';
import PostOptionsImage from './styles/images/how/13.png';
import HomeScreenImage from './styles/images/how/7.png';
import PostAndArticleScreenImage from './styles/images/how/7h.png';
import PostCreateScreenImage from './styles/images/how/10.png';
import ArticleCreateScreenImage from './styles/images/how/9.png';

import ArtImage1 from './styles/images/content/1.jpg';
import ArtImage2 from './styles/images/content/2.jpg';
import ArtImage3 from './styles/images/content/3.jpg';
import ArtImage4 from './styles/images/content/4.jpg';
import ArtImage5 from './styles/images/content/5.jpg';
import ArtImage6 from './styles/images/content/6.jpeg';
import ArtImage7 from './styles/images/content/7.jpg';

import SportImage1 from './styles/images/content/8.jpg';
import SportImage2 from './styles/images/content/9.jpg';
import SportImage3 from './styles/images/content/10.jpg';
import SportImage4 from './styles/images/content/11.jpg';
import SportImage5 from './styles/images/content/12.jpg';
import SportImage6 from './styles/images/content/13.jpg';

import ScienceImage1 from './styles/images/content/14.jpg';
import ScienceImage2 from './styles/images/content/15.jpg';
import ScienceImage3 from './styles/images/content/16.jpg';
import ScienceImage4 from './styles/images/content/17.jpg';
import ScienceImage5 from './styles/images/content/18.jpg';
import ScienceImage6 from './styles/images/content/19.jpg';
import ScienceImage7 from './styles/images/content/20.jpg';
import ScienceImage8 from './styles/images/content/21.jpg';

import MusicImage1 from './styles/images/content/22.jpg';
import MusicImage2 from './styles/images/content/23.jpg';
import MusicImage3 from './styles/images/content/24.jpg';
import MusicImage4 from './styles/images/content/25.jpg';
import MusicImage5 from './styles/images/content/26.jpg';
import MusicImage6 from './styles/images/content/27.jpg';
import MusicImage7 from './styles/images/content/28.jpg';
import MusicImage8 from './styles/images/content/29.jpg';
import MusicImage9 from './styles/images/content/30.jpg';

import SpringBootImage from './styles/images/content/31.jpg';
import ReactImage from './styles/images/content/32.jpg';
import PostgreSQLImage from './styles/images/content/33.jpg';
import AWSImage from './styles/images/content/34.jpg';
import JavaImage from './styles/images/content/35.jpg';
import JavaScriptImage from './styles/images/content/36.jpg';
import HasuraImage from './styles/images/content/37.jpg';

function Start() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('What Content Can Be Shared');
  const [activeComponent, setActiveComponent] = useState(null);

  const handleSignUpClick = (event) => {
    event.preventDefault();
    navigate('/start');
  };

  const openComponent = (component) => {
    setActiveComponent(component);
  };

  const closeComponent = () => {
    setActiveComponent(null);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'How to Use':
        return (
          <div className="dropdown-content-grid">
            <div className="dropdown-item" onClick={() => openComponent('Sign Up')}><h2>Sign Up</h2></div>
            <div className="dropdown-item" onClick={() => openComponent('Sign In')}><h2>Sign In</h2></div>
            <div className="dropdown-item" onClick={() => openComponent('Change Password')}><h2>Change Password</h2></div>
            <div className="dropdown-item" onClick={() => openComponent('User Screen')}><h2>User Screen</h2></div>
            <div className="dropdown-item" onClick={() => openComponent('Edit User Screen')}><h2>Edit User Screen</h2></div>
            <div className="dropdown-item" onClick={() => openComponent('Edit Post and Edit Article')}><h2>Edit Post and Edit Article</h2></div>
            <div className="dropdown-item" onClick={() => openComponent('Home Screen')}><h2>Home Screen</h2></div>
            <div className="dropdown-item" onClick={() => openComponent('Post and Article Screen')}><h2>Post and Article Screen</h2></div>
            <div className="dropdown-item" onClick={() => openComponent('Post Create Screen')}><h2>Post Create Screen</h2></div>
            <div className="dropdown-item" onClick={() => openComponent('Article Create Screen')}><h2>Article Create Screen</h2></div>
          </div>
        );
      case 'What Content Can Be Shared':
        return (
          <div className="content-grid">
            {/* Art Section */}
            <div className="content-item">
              <img src={ArtImage1} alt="Art 1" className="content-image" />
              <p>Explore various forms of art, from abstract paintings to intricate sculptures. Share your own artwork or discuss famous pieces.</p>
            </div>
            <div className="content-item">
              <img src={ArtImage2} alt="Art 2" className="content-image" />
              <p>Architecture can be a form of art too. Share stunning examples of architectural design and discuss the impact of architecture on culture.</p>
            </div>
            <div className="content-item">
              <img src={ArtImage3} alt="Art 3" className="content-image" />
              <p>Line art is a simple yet expressive form of art. Share your line art creations and discuss techniques and inspiration behind them.</p>
            </div>
            <div className="content-item">
              <img src={ArtImage4} alt="Art 4" className="content-image" />
              <p>Classical sculptures like Michelangelo's David are timeless. Share your thoughts on classical art and its influence on modern creations.</p>
            </div>
            <div className="content-item">
              <img src={ArtImage5} alt="Art 5" className="content-image" />
              <p>Surreal art can be captivating and thought-provoking. Share your surreal artwork or discuss the works of famous surreal artists.</p>
            </div>
            <div className="content-item">
              <img src={ArtImage6} alt="Art 6" className="content-image" />
              <p>Rococo art is known for its ornate and decorative style. Share your Rococo-inspired art or discuss the historical context of this style.</p>
            </div>
            <div className="content-item">
              <img src={ArtImage7} alt="Art 7" className="content-image" />
              <p>Gothic architecture is both haunting and beautiful. Share photos of Gothic structures and discuss their historical significance.</p>
            </div>
            {/* Sport Section */}
            <div className="content-item">
              <img src={SportImage1} alt="Sport 1" className="content-image" />
              <p>Running is a popular sport that builds endurance and strength. Share your running achievements or discuss techniques for improving speed and stamina.</p>
            </div>
            <div className="content-item">
              <img src={SportImage2} alt="Sport 2" className="content-image" />
              <p>Cycling is both a sport and a mode of transport. Share your cycling adventures, routes, and tips for maintaining your bike.</p>
            </div>
            <div className="content-item">
              <img src={SportImage3} alt="Sport 3" className="content-image" />
              <p>Tennis is a sport that combines skill and strategy. Share your tennis experiences, match strategies, and training routines.</p>
            </div>
            <div className="content-item">
              <img src={SportImage4} alt="Sport 4" className="content-image" />
              <p>Martial arts require discipline and strength. Share your martial arts journey, techniques, and the philosophy behind your practice.</p>
            </div>
            <div className="content-item">
              <img src={SportImage5} alt="Sport 5" className="content-image" />
              <p>Fitness and aerobics are great for staying in shape. Share your workout routines, fitness goals, and tips for staying motivated.</p>
            </div>
            <div className="content-item">
              <img src={SportImage6} alt="Sport 6" className="content-image" />
              <p>Basketball is a team sport that requires skill and coordination. Share your basketball highlights, training tips, and favorite plays.</p>
            </div>
            {/* Science Section */}
            <div className="content-item">
              <img src={ScienceImage1} alt="Science 1" className="content-image" />
              <p>Laboratory research is at the heart of scientific discovery. Share your research projects, findings, and experiments.</p>
            </div>
            <div className="content-item">
              <img src={ScienceImage2} alt="Science 2" className="content-image" />
              <p>Chemical reactions and experiments are fascinating. Share your experiences and findings from your chemistry experiments.</p>
            </div>
            <div className="content-item">
              <img src={ScienceImage3} alt="Science 3" className="content-image" />
              <p>DNA research has revolutionized our understanding of biology. Share your insights and discoveries related to genetics and DNA.</p>
            </div>
            <div className="content-item">
              <img src={ScienceImage4} alt="Science 4" className="content-image" />
              <p>Physics explores the fundamental principles of the universe. Share your knowledge and experiments related to physics.</p>
            </div>
            <div className="content-item">
              <img src={ScienceImage5} alt="Science 5" className="content-image" />
              <p>Microbiology involves studying tiny organisms. Share your findings and insights from your microbiology research.</p>
            </div>
            <div className="content-item">
              <img src={ScienceImage6} alt="Science 6" className="content-image" />
              <p>The cosmos is vast and mysterious. Share your astronomical observations and theories about the universe.</p>
            </div>
            <div className="content-item">
              <img src={ScienceImage7} alt="Science 7" className="content-image" />
              <p>Space exploration uncovers new frontiers. Share your thoughts on recent space missions and astronomical discoveries.</p>
            </div>
            <div className="content-item">
              <img src={ScienceImage8} alt="Science 8" className="content-image" />
              <p>The beauty of the universe can be seen in every corner. Share your astronomical photos and discuss their significance.</p>
            </div>
            {/* Music Section */}
            <div className="content-item">
              <img src={MusicImage1} alt="Music 1" className="content-image" />
              <p>Music is a universal language that speaks to the soul. Share your favorite compositions and discuss their impact on you.</p>
            </div>
            <div className="content-item">
              <img src={MusicImage2} alt="Music 2" className="content-image" />
              <p>Analog music media, like cassettes, have a nostalgic charm. Share your collection and discuss the evolution of music formats.</p>
            </div>
            <div className="content-item">
              <img src={MusicImage3} alt="Music 3" className="content-image" />
              <p>Live concerts are exhilarating experiences. Share your concert photos, videos, and memorable moments from live performances.</p>
            </div>
            <div className="content-item">
              <img src={MusicImage4} alt="Music 4" className="content-image" />
              <p>Iconic bands have left a lasting legacy in music. Share your favorite bands and discuss their influence on music history.</p>
            </div>
            <div className="content-item">
              <img src={MusicImage5} alt="Music 5" className="content-image" />
              <p>Music can transport us to another world. Share your listening experiences and the impact of music on your mood and creativity.</p>
            </div>
            <div className="content-item">
              <img src={MusicImage6} alt="Music 6" className="content-image" />
              <p>Musical instruments are the heart of compositions. Share your journey with learning instruments and your favorite pieces to play.</p>
            </div>
            <div className="content-item">
              <img src={MusicImage7} alt="Music 7" className="content-image" />
              <p>Classical music has a timeless appeal. Share your experiences with classical music and your favorite compositions.</p>
            </div>
            <div className="content-item">
              <img src={MusicImage8} alt="Music 8" className="content-image" />
              <p>Reggae music, with its unique rhythm, has a global influence. Share your thoughts on reggae artists and their impact on music.</p>
            </div>
            <div className="content-item">
              <img src={MusicImage9} alt="Music 9" className="content-image" />
              <p>Music is a journey of the mind. Share your favorite instrumental pieces and how they inspire your creativity and emotions.</p>
            </div>
          </div>
        );
      case 'Technologies Used on the Website':
        return (
          <div>
            <div className="tech-details">
              <h2>Project Overview</h2>
              <p>The project hosted in the GitHub repositories demog and des aims to create a web application where users can share various types of content such as posts and articles. This application is designed to be a platform for users to share their creative works, thoughts, and insights on various topics including art, science, sports, and music.</p>
              <h2>Backend Technologies</h2>
              <p>The backend of the application is built using Java Spring Boot, a powerful framework that simplifies the development of web applications by providing a comprehensive infrastructure for building RESTful web services. It handles all the necessary configurations, enabling developers to focus on writing business logic.

The application uses PostgreSQL as its database, which is a robust and reliable open-source relational database management system. PostgreSQL is known for its strong support for SQL standards and its extensive functionality.

AWS services are used to host the backend, providing scalability and high availability. Specifically, AWS EC2 (Elastic Compute Cloud) instances are used to run the backend services. EC2 provides resizable compute capacity, allowing the application to scale based on the demand.

Hasura is integrated into the project to provide a GraphQL engine. This engine makes data accessible through a GraphQL API, enabling real-time data fetching and updates. Hasura sits on top of PostgreSQL and automatically generates a GraphQL API based on the database schema.</p>
<h2>Frontend Technologies</h2>
<p>The frontend of the application is developed using React JS, a popular JavaScript library for building user interfaces. React allows developers to create reusable UI components, making the development process more efficient. The frontend communicates with the backend through RESTful APIs, fetching and displaying data dynamically.

JavaScript is extensively used to add interactivity and enhance the user experience. JavaScript, along with React, ensures that the web application is responsive and interactive, providing a seamless experience for the users.</p>
<h2>Project Purpose and Functionality</h2>
<p>The primary purpose of this project is to create a social platform where users can share and explore content in various categories. Users can create accounts, log in, and post their content in the form of articles or media posts. They can follow other users, like and comment on posts, and engage with the community.

The project aims to foster a creative and interactive environment, encouraging users to share their knowledge and creations. It leverages modern web technologies to provide a robust and scalable platform, ensuring a smooth and engaging user experience.</p>
<h2>AWS EC2 Usage</h2>
<p>AWS EC2 is used in this project to provide the necessary compute capacity for running the backend services. EC2 instances are configured to handle the web traffic, process requests, and perform necessary computations. This ensures that the application can handle a large number of concurrent users and can scale based on the demand. The flexibility of EC2 allows the project to optimize costs by scaling resources up or down as needed.</p>
<h2>Hasura Database Integration</h2>
<p>Hasura is used to enhance the interaction with the PostgreSQL database. By providing a GraphQL API, Hasura allows for efficient and real-time data fetching. This integration simplifies the backend development, as Hasura takes care of generating the necessary GraphQL queries and mutations based on the database schema. It ensures that the frontend can interact with the database in a flexible and efficient manner, providing real-time updates and a seamless user experience.</p>
<p>In summary, this project combines the power of Spring Boot, React, PostgreSQL, AWS, and Hasura to create a comprehensive platform for content sharing. It leverages modern web technologies to ensure scalability, reliability, and an engaging user experience.</p>
            </div>
            <div className="content-grid">
              <div className="content-item">
                <img src={SpringBootImage} alt="Spring Boot" className="content-image" />
                <p>Spring Boot: Used for creating the backend of the application, providing RESTful web services and handling business logic.</p>
              </div>
              <div className="content-item">
                <img src={AWSImage} alt="AWS" className="content-image" />
                <p>AWS: Provides the infrastructure to host the application, including EC2 instances and S3 storage.</p>
              </div>
              <div className="content-item">
                <img src={JavaScriptImage} alt="JavaScript" className="content-image" />
                <p>JavaScript: Used in the frontend to add interactivity and dynamic content to the web pages.</p>
              </div>
              <div className="content-item">
                <img src={ReactImage} alt="React JS" className="content-image" />
                <p>React JS: Used for building the frontend of the application, providing a dynamic and interactive user interface.</p>
              </div>
              <div className="content-item">
                <img src={JavaImage} alt="Java" className="content-image" />
                <p>Java: The primary programming language used for developing the backend services.</p>
              </div>
              <div className="content-item">
                <img src={PostgreSQLImage} alt="PostgreSQL" className="content-image" />
                <p>PostgreSQL: Used as the database to store user data, posts, and other relevant information.</p>
              </div>
              <div className="content-item">
                <img src={HasuraImage} alt="Hasura" className="content-image" />
                <p>Hasura: Provides a GraphQL engine that makes data accessible through a GraphQL API, enabling real-time data fetching and updates.</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="start-container">
      <nav className="navbar">
        <ul className="navbar-list">
          <li><button className="navbar-button" onClick={() => setActiveSection('How to Use')}>How to Use?</button></li>
          <li><button className="navbar-button" onClick={() => setActiveSection('What Content Can Be Shared')}>What Content Can Be Shared?</button></li>
          <li><button className="navbar-button" onClick={() => setActiveSection('Technologies Used on the Website')}>Technologies Used on the Website</button></li>
          <li><button className="navbar-button" onClick={handleSignUpClick}>Sign Up</button></li>
        </ul>
      </nav>
      {renderContent()}
      {activeComponent && (
        <div className="modal" onClick={closeComponent}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-button" onClick={closeComponent}>&times;</span>
            {activeComponent === 'Sign Up' && (
              <div>
                <img src={SignupImage} alt="Signup" className="modal-image" />
                <div className="modal-text">
                  <p>
                    In the Signup screen, you need to enter information such as username, email address, password, and password hint.
                    As shown in the photo, this form allows users to create an account. You need to fill in the following fields:
                  </p>
                  <ul>
                    <li>Username: Must be at least 3 characters.</li>
                    <li>Email Address: Must be a valid email address.</li>
                    <li>Password: Must be at least 8 characters, including one uppercase letter, one lowercase letter, and one number.</li>
                    <li>Password Hint: A hint to help you remember your password.</li>
                  </ul>
                </div>
              </div>
            )}
            {activeComponent === 'Sign In' && (
              <div>
                <img src={SigninImage} alt="Signin" className="modal-image" />
                <div className="modal-text">
                  <p>
                    In the Signin screen, you need to enter information such as your email address and password.
                    As shown in the photo, this form allows users to log in to their account. You need to fill in the following fields:
                  </p>
                  <ul>
                    <li>Email Address: Must be a valid email address.</li>
                    <li>Password: Enter the password for your account.</li>
                  </ul>
                </div>
              </div>
            )}
            {activeComponent === 'Change Password' && (
              <div>
                <img src={ChangePasswordImage} alt="Change Password" className="modal-image" />
                <div className="modal-text">
                  <p>
                    In the Change Password screen, you need to enter your current password and your new password.
                    As shown in the photo, this form allows users to change their password. You need to fill in the following fields:
                  </p>
                  <ul>
                    <li>Username or Email Address: Enter a valid username or email address.</li>
                    <li>Password Hint: A hint to help you remember your password.</li>
                    <li>New Password: Must be at least 8 characters, including one uppercase letter, one lowercase letter, and one number.</li>
                  </ul>
                </div>
              </div>
            )}
            {activeComponent === 'User Screen' && (
              <div>
                <img src={UserScreenImage1} alt="User Screen" className="modal-image" />
                <div className="modal-text">
                  <p>
                    In the User Screen, the user's profile is displayed. The profile photo can be changed by clicking the pencil icon above the photo.
                    The user's connections, followers, and followings are shown.
                    There is a section on the right for biography in the User Screen. Username, follower count, and connection details are displayed here.
                  </p>
                </div>
                <img src={UserScreenImage2} alt="User Screen Options" className="modal-image" />
                <div className="modal-text">
                  <p>
                    There are two buttons at the bottom of the user profile: Posts and Articles. The user's posts or articles are listed here.
                    You can click on each post or article to view the details.
                  </p>
                </div>
                <img src={UserScreenImage3} alt="User Screen Posts and Articles" className="modal-image" />
                <div className="modal-text">
                  <p>
                    By clicking the three dots in the top right corner, you can access options to edit the profile, log out, and change the background photo.
                  </p>
                </div>
              </div>
            )}
            {activeComponent === 'Edit User Screen' && (
              <div>
                <img src={EditUserScreenImage} alt="Edit User Screen" className="modal-image" />
                <div className="modal-text">
                  <p>
                    In the Edit User Screen, you can edit user information such as username, biography, and connections.
                    You need to fill in the following fields:
                  </p>
                  <ul>
                    <li>Name: The field where you enter the username.</li>
                    <li>Bio: The field where you enter the user's biography.</li>
                    <li>Connections: Fields where you can add the user's connections on other external websites and applications. You can enter a name and link for each connection.</li>
                    <li>Tick Icon: Click this button to save the entered information.</li>
                  </ul>
                </div>
              </div>
            )}
            {activeComponent === 'Edit Post and Edit Article' && (
              <div>
                <img src={EditPostOrArticleImage} alt="Edit Post or Article" className="modal-image" />
                <div className="modal-text">
                  <p>
                    In the Edit Post screen, you can edit your existing posts. By clicking the three-dot icon in the top right corner of the post, you can access Edit Post and Delete Post options.
                  </p>
                </div>
                <img src={PostOptionsImage} alt="Post Options" className="modal-image" />
                <div className="modal-text">
                  <p>
                    Click Edit Post to edit your post, and click Delete Post to delete your post. You can perform the same actions for your articles; only the options are Edit Article and Delete Article instead of Edit Post and Delete Post.
                  </p>
                </div>
              </div>
            )}
            {activeComponent === 'Home Screen' && (
              <div>
                <img src={HomeScreenImage} alt="Home Screen" className="modal-image" />
                <div className="modal-text">
                  <p>
                    In the Home Screen, the posts and articles of the users you follow are displayed. From here, you can access updates from the users you follow.
                  </p>
                </div>
              </div>
            )}
            {activeComponent === 'Post and Article Screen' && (
              <div>
                <img src={PostAndArticleScreenImage} alt="Post and Article Screen" className="modal-image" />
                <div className="modal-text">
                  <p>
                    In the Post and Article Screen, all the posts and articles on the site are displayed. Users can access all the posts and articles from this screen.
                  </p>
                </div>
              </div>
            )}
            {activeComponent === 'Post Create Screen' && (
              <div>
                <img src={PostCreateScreenImage} alt="Post Create Screen" className="modal-image" />
                <div className="modal-text">
                  <p>
                    In the Post Create Screen, you can create a new post.
                    You need to write the title and content of the post.
                    You can click on the article icon to add a link to an existing article or one you wrote yourself.
                    You can add a YouTube video by clicking on the YouTube icon or upload a video from your computer by clicking on the video icon.
                    You can upload the desired photos by dragging and dropping them into the drag and drop area or by clicking on it. After filling in all the fields, you can create the post by clicking on the tick icon.
                  </p>
                </div>
              </div>
            )}
            {activeComponent === 'Article Create Screen' && (
              <div>
                <img src={ArticleCreateScreenImage} alt="Article Create Screen" className="modal-image" />
                <div className="modal-text">
                  <p>
                    In the Article Create Screen, you can create a new article.
                    You need to write the title and content of your article.
                    You can upload as many photos as you want for the article using the drag and drop area and create the article by clicking on the tick icon.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Start;
