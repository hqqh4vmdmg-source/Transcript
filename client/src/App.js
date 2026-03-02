import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TranscriptPage from './pages/TranscriptPage';
import TranscriptList from './components/TranscriptList';
import TranscriptEditor from './components/TranscriptEditor';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function AppContent() {
  const location = useLocation();
  const [transcriptMode, setTranscriptMode] = useState('high_school');
  const showToggle = location.pathname === '/transcript';

  return (
    <div className="App">
      <Header 
        transcriptMode={showToggle ? transcriptMode : undefined} 
        setTranscriptMode={showToggle ? setTranscriptMode : undefined} 
      />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/transcript" element={<TranscriptPage mode={transcriptMode} />} />
          <Route path="/transcript/high-school" element={<TranscriptPage mode="high_school" />} />
          <Route path="/transcript/college" element={<TranscriptPage mode="college" />} />
          <Route path="/transcripts" element={<TranscriptList />} />
          <Route path="/transcripts/edit/:id" element={<TranscriptEditor />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
