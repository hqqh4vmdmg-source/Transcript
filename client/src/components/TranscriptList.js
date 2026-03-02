import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import transcriptService from '../services/transcriptService';
import './TranscriptList.css';

const TranscriptList = () => {
  const { isAuthenticated, loading: authLoading, token } = useAuth();
  const navigate = useNavigate();
  
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Search & filter state
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sort, setSort] = useState('newest');

  const loadTranscripts = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    try {
      const response = await transcriptService.getTranscripts(token, { type: filterType, search, sort });
      setTranscripts(response.transcripts || []);
    } catch (error) {
      console.error('Error loading transcripts:', error);
      setMessage('Failed to load transcripts');
    } finally {
      setLoading(false);
    }
  }, [token, filterType, search, sort]);

  useEffect(() => {
    loadTranscripts();
  }, [loadTranscripts]);

  const handleEdit = (id) => {
    navigate(`/transcripts/edit/${id}`);
  };

  const handleDownload = async (id) => {
    try {
      await transcriptService.downloadPDF(token, id);
    } catch (error) {
      console.error('Error downloading transcript:', error);
      setMessage('Failed to download PDF');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await transcriptService.duplicateTranscript(token, id);
      setMessage('Transcript duplicated successfully');
      loadTranscripts();
    } catch (error) {
      console.error('Error duplicating transcript:', error);
      setMessage('Failed to duplicate transcript');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transcript?')) {
      try {
        await transcriptService.deleteTranscript(token, id);
        setTranscripts(transcripts.filter(t => t.id !== id));
        setMessage('Transcript deleted successfully');
      } catch (error) {
        console.error('Error deleting transcript:', error);
        setMessage('Failed to delete transcript');
      }
    }
  };

  if (authLoading || loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="transcript-list">
      <div className="transcript-list__header">
        <h2>My Transcripts</h2>
        <div className="header-actions">
          <button onClick={() => navigate('/transcript/high-school')} className="btn btn--primary">
            Create High School Transcript
          </button>
          <button onClick={() => navigate('/transcript/college')} className="btn btn--primary">
            Create College Transcript
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="transcript-list__filters">
        <input
          type="text"
          className="filter-search"
          placeholder="Search by student or school name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="high_school">High School</option>
          <option value="college">College</option>
        </select>
        <select
          className="filter-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {message && (
        <div className={`message ${message.includes('success') ? 'message--success' : 'message--error'}`}>
          {message}
        </div>
      )}

      {transcripts.length === 0 ? (
        <div className="empty-state">
          <p>No transcripts found. {search || filterType ? 'Try adjusting your filters.' : 'Create your first transcript to get started!'}</p>
        </div>
      ) : (
        <div className="transcript-grid">
          {transcripts.map(transcript => (
            <div key={transcript.id} className="transcript-card">
              <div className="transcript-card__header">
                <h3>{transcript.data.studentName || 'Unnamed Student'}</h3>
                <span className={`badge badge--${transcript.type}`}>
                  {transcript.type === 'high_school' ? 'High School' : 'College'}
                </span>
              </div>
              
              <div className="transcript-card__body">
                <div className="info-row">
                  <span className="label">School:</span>
                  <span className="value">{transcript.data.schoolName || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Student ID:</span>
                  <span className="value">{transcript.data.studentId || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="label">GPA:</span>
                  <span className="value gpa">{transcript.data.cumulativeGPA || 'N/A'}</span>
                </div>
                {transcript.type === 'college' && transcript.data.major && (
                  <div className="info-row">
                    <span className="label">Major:</span>
                    <span className="value">{transcript.data.major}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="label">Created:</span>
                  <span className="value">{new Date(transcript.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="transcript-card__actions">
                <button
                  onClick={() => handleEdit(transcript.id)}
                  className="btn btn--edit"
                  title="Edit personal information before generating PDF"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDownload(transcript.id)}
                  className="btn btn--download"
                  title="Download PDF"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => handleDuplicate(transcript.id)}
                  className="btn btn--duplicate"
                  title="Duplicate this transcript"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => handleDelete(transcript.id)}
                  className="btn btn--delete"
                  title="Delete transcript"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TranscriptList;

