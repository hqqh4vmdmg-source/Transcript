import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = ({ transcriptMode, setTranscriptMode }) => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__logo">
          <Link to="/">Transcript Generator</Link>
        </div>
        
        <nav className="header__nav">
          <Link to="/" className="header__nav-link">Home</Link>
          <Link to="/about" className="header__nav-link">About</Link>
          <Link to="/contact" className="header__nav-link">Contact</Link>
          {isAuthenticated && (
            <>
              <Link to="/transcript" className="header__nav-link">Generate</Link>
              <Link to="/transcripts" className="header__nav-link">My Transcripts</Link>
            </>
          )}
        </nav>

        <div className="header__actions">
          {transcriptMode !== undefined && (
            <div className="header__toggle">
              <label className="toggle">
                <span className="toggle__label">High School</span>
                <input
                  type="checkbox"
                  checked={transcriptMode === 'college'}
                  onChange={(e) => setTranscriptMode(e.target.checked ? 'college' : 'high_school')}
                />
                <span className="toggle__slider"></span>
                <span className="toggle__label">College</span>
              </label>
            </div>
          )}
          
          {isAuthenticated ? (
            <div className="header__user">
              <Link to="/profile" className="header__btn header__btn--profile">
                {user?.username}
              </Link>
              <button onClick={handleLogout} className="header__btn header__btn--logout">
                Logout
              </button>
            </div>
          ) : (
            <div className="header__auth">
              <Link to="/login" className="header__btn header__btn--login">
                Login
              </Link>
              <Link to="/register" className="header__btn header__btn--register">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
