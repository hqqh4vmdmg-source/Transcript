import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TranscriptGenerator from '../components/TranscriptGenerator';

const TranscriptPage = ({ mode = 'high_school' }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="transcript-page">
      <TranscriptGenerator mode={mode} />
    </div>
  );
};

export default TranscriptPage;
