import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../config/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      verifyToken(tokenFromUrl);
    } else {
      setVerifying(false);
      setError('Reset token is missing. Please use the link from your email.');
    }
  }, [searchParams]);

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await api.get(`/auth/reset-password?token=${tokenToVerify}`);
      if (response.data.valid) {
        setTokenValid(true);
      } else {
        setError('Invalid or expired reset token. Please request a new password reset.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired reset token. Please request a new password reset.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/reset-password', { token, password });
      setMessage(response.data.message || 'Password has been reset successfully.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="auth-page container" style={{ padding: '4rem 0', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}>Verifying reset token...</div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="auth-page container" style={{ padding: '4rem 0', maxWidth: '500px', margin: '0 auto' }}>
        <h1>Reset Password</h1>
        <div className="auth-form" style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: 'var(--shadow)', marginTop: '2rem' }}>
          {error && <div style={{ background: '#fee', color: '#c33', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/forgot-password" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
              Request a new password reset link
            </Link>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page container" style={{ padding: '4rem 0', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit} className="auth-form" style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: 'var(--shadow)', marginTop: '2rem' }}>
        <p>Enter your new password below.</p>
        
        {message && <div style={{ background: '#efe', color: 'var(--success-color)', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>{message}</div>}
        {error && <div style={{ background: '#fee', color: '#c33', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>New Password *</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter new password"
            style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '16px' }}
            minLength={6}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Confirm Password *</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm new password"
            style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '16px' }}
            minLength={6}
          />
        </div>

        <button type="submit" className="btn btn-primary full-width" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </button>

        <div className="auth-links" style={{ textAlign: 'center', marginTop: '1rem', fontSize: '14px' }}>
          <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Back to Login</Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
