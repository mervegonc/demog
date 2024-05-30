
import React, { useState } from 'react';
import './styles/Entry.css';
import leftImage from './styles/images/left.jpg';
import SigninForm from './SigninForm';
import SignupForm from './SignupForm';
import logo from './styles/images/ark.png';
import { Link } from 'react-router-dom'; // React Router Link ekleyin
const Entry = () => {
  const [showSignin, setShowSignin] = useState(true);
  const [showSignup, setShowSignup] = useState(false);

  const handleSigninClick = () => {
    setShowSignin(true);
    setShowSignup(false);
  };

  const handleSignupClick = () => {
    setShowSignup(true);
    setShowSignin(false);
  };

  return (
    <div>
      <div className="left-panel">
        <img src={leftImage} alt="Left" />
      </div>

      <div className="right-panel">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>

        {showSignin && (
          <div className="signin-form-container">
            <SigninForm />
            <p className="signin-info">Don't you have an account?  <span className="signup-link" onClick={handleSignupClick}>Sign Up for Free</span></p>
            <p className="signin-info"><Link to="/forgotpassword" className="forgot-password-link">Forgot Password?</Link></p> {/* Forgot Password Link */}
          </div>
        )}
        {showSignup && (
          <div className="signup-form-container">
            <SignupForm />

            <p className="signin-info">Already have an account? <span className="signin-link" onClick={handleSigninClick}>Sign In</span></p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Entry;