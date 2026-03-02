import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>About Transcript Generator</h1>
        <p>Your trusted platform for generating professional transcripts</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            We are dedicated to providing students and educational institutions with a simple, 
            secure, and efficient way to generate official-looking transcripts. Our platform 
            bridges the gap between manual transcript creation and professional documentation needs.
          </p>
        </section>

        <section className="about-section">
          <h2>What We Offer</h2>
          <div className="features-list">
            <div className="feature-item">
              <h3>High School Transcripts</h3>
              <p>Create comprehensive high school transcripts with all necessary details including courses, grades, and GPA.</p>
            </div>
            <div className="feature-item">
              <h3>College Transcripts</h3>
              <p>Generate professional college transcripts with major, degree information, and detailed course history.</p>
            </div>
            <div className="feature-item">
              <h3>PDF Generation</h3>
              <p>Download your transcripts as high-quality PDF documents suitable for printing and official use.</p>
            </div>
            <div className="feature-item">
              <h3>Secure Storage</h3>
              <p>All your data is securely encrypted and stored with industry-standard security practices.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Our Team</h2>
          <p>
            Our team consists of experienced developers and education technology specialists 
            who understand the importance of accurate and professional documentation. We continuously 
            work to improve our platform and add new features based on user feedback.
          </p>
        </section>

        <section className="about-section">
          <h2>Contact Information</h2>
          <div className="contact-info">
            <p><strong>Email:</strong> support@transcriptgenerator.com</p>
            <p><strong>Address:</strong> 123 Education Lane, Suite 100, Learning City, LC 12345</p>
            <p><strong>Phone:</strong> (555) 123-4567</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
