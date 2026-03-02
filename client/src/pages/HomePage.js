import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__content">
          <h1 className="hero__title">Generate Professional Transcripts</h1>
          <p className="hero__subtitle">
            Create high school and college transcripts quickly and easily with our user-friendly platform
          </p>
          <div className="hero__actions">
            {isAuthenticated ? (
              <Link to="/transcript" className="btn btn--primary">
                Get Started
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn--primary">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn--secondary">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features__container">
          <h2 className="features__title">Why Choose Us?</h2>
          <div className="features__grid">
            <div className="feature">
              <div className="feature__icon">📄</div>
              <h3 className="feature__title">Professional Templates</h3>
              <p className="feature__description">
                Use our carefully designed templates for both high school and college transcripts
              </p>
            </div>
            
            <div className="feature">
              <div className="feature__icon">⚡</div>
              <h3 className="feature__title">Quick Generation</h3>
              <p className="feature__description">
                Generate your transcript in minutes with our intuitive form interface
              </p>
            </div>
            
            <div className="feature">
              <div className="feature__icon">🔒</div>
              <h3 className="feature__title">Secure & Private</h3>
              <p className="feature__description">
                Your data is encrypted and stored securely with industry-standard practices
              </p>
            </div>
            
            <div className="feature">
              <div className="feature__icon">📥</div>
              <h3 className="feature__title">PDF Download</h3>
              <p className="feature__description">
                Download your transcript as a professional PDF document
              </p>
            </div>
            
            <div className="feature">
              <div className="feature__icon">🔄</div>
              <h3 className="feature__title">Easy Toggle</h3>
              <p className="feature__description">
                Switch between high school and college modes with a simple toggle
              </p>
            </div>
            
            <div className="feature">
              <div className="feature__icon">💾</div>
              <h3 className="feature__title">Save & Edit</h3>
              <p className="feature__description">
                Save your transcripts and come back to edit them anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="testimonials__container">
          <h2 className="testimonials__title">What Our Users Say</h2>
          <div className="testimonials__grid">
            <div className="testimonial">
              <p className="testimonial__text">
                "This tool made it so easy to create my transcript for college applications. 
                The interface is intuitive and the output looks professional!"
              </p>
              <div className="testimonial__author">
                <strong>Sarah M.</strong>
                <span>High School Student</span>
              </div>
            </div>
            
            <div className="testimonial">
              <p className="testimonial__text">
                "I needed to generate transcripts for multiple semesters, and this platform 
                saved me hours of work. Highly recommended!"
              </p>
              <div className="testimonial__author">
                <strong>John D.</strong>
                <span>College Student</span>
              </div>
            </div>
            
            <div className="testimonial">
              <p className="testimonial__text">
                "The ability to switch between high school and college formats is fantastic. 
                Everything I needed in one place!"
              </p>
              <div className="testimonial__author">
                <strong>Emily R.</strong>
                <span>Transfer Student</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta__content">
          <h2>Ready to Get Started?</h2>
          <p>Create your professional transcript today</p>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn--primary btn--large">
              Sign Up Now
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
