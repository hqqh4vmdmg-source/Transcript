import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, token, loading, refreshUser } = useAuth();

  const [profileForm, setProfileForm] = useState({ username: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Populate form with current user data once loaded
  const [initialized, setInitialized] = useState(false);
  if (user && !initialized) {
    setProfileForm({ username: user.username || '', email: user.email || '' });
    setInitialized(true);
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (!token) return <Navigate to="/login" />;

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg('');
    try {
      const updates = {};
      if (profileForm.username !== user.username) updates.username = profileForm.username;
      if (profileForm.email !== user.email) updates.email = profileForm.email;

      if (Object.keys(updates).length === 0) {
        setProfileMsg('No changes to save.');
        setProfileLoading(false);
        return;
      }

      await authService.updateProfile(token, updates);
      setProfileMsg('Profile updated successfully!');
      await refreshUser();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to update profile.';
      setProfileMsg(msg);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg('New passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg('New password must be at least 6 characters.');
      return;
    }
    setPasswordLoading(true);
    try {
      await authService.changePassword(token, passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMsg('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to change password.';
      setPasswordMsg(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h2>My Profile</h2>

        {user && (
          <div className="profile-info-bar">
            <span className="profile-avatar">{(user.username || 'U')[0].toUpperCase()}</span>
            <div>
              <div className="profile-username">{user.username}</div>
              <div className="profile-email">{user.email}</div>
            </div>
          </div>
        )}

        {/* Update Profile */}
        <section className="profile-section">
          <h3>Update Profile</h3>
          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                value={profileForm.username}
                onChange={handleProfileChange}
                minLength={3}
                maxLength={50}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                required
              />
            </div>
            {profileMsg && (
              <div className={`profile-message ${profileMsg.includes('successfully') ? 'success' : 'error'}`}>
                {profileMsg}
              </div>
            )}
            <button type="submit" className="btn btn--primary" disabled={profileLoading}>
              {profileLoading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </section>

        {/* Change Password */}
        <section className="profile-section">
          <h3>Change Password</h3>
          <form onSubmit={handlePasswordSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                minLength={6}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                minLength={6}
                required
                autoComplete="new-password"
              />
            </div>
            {passwordMsg && (
              <div className={`profile-message ${passwordMsg.includes('successfully') ? 'success' : 'error'}`}>
                {passwordMsg}
              </div>
            )}
            <button type="submit" className="btn btn--primary" disabled={passwordLoading}>
              {passwordLoading ? 'Changing…' : 'Change Password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
