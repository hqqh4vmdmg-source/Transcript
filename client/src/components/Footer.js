import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__section">
          <h3>Transcript Generator</h3>
          <p>Generate professional high school and college transcripts with ease.</p>
        </div>
        
        <div className="footer__section">
          <h4>Quick Links</h4>
          <ul className="footer__links">
            <li><Link to="/about">Privacy Policy</Link></li>
            <li><Link to="/contact">Terms of Service</Link></li>
            <li><Link to="/about">FAQ</Link></li>
          </ul>
        </div>
        
        <div className="footer__section">
          <h4>Follow Us</h4>
          <div className="footer__social">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <i className="social-icon">𝕏</i>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="social-icon">f</i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <i className="social-icon">in</i>
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer__bottom">
        <p>&copy; {new Date().getFullYear()} Transcript Generator. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
