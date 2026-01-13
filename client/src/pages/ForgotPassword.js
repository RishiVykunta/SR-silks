import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // TODO: Implement password reset API call
    setTimeout(() => {
      setMessage('Password reset instructions have been sent to your email.');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="auth-page container" style={{ padding: '4rem 0', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Forgot Password</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <p>Enter your email address and we'll send you instructions to reset your password.</p>
        
        {message && <div className="success">{message}</div>}

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>

        <button type="submit" className="btn btn-primary full-width" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Instructions'}
        </button>

        <div className="auth-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </form>

      <style>{`
        .auth-form {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: var(--shadow);
          margin-top: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          font-size: 16px;
        }

        .auth-links {
          text-align: center;
          margin-top: 1rem;
          font-size: 14px;
        }

        .auth-links a {
          color: var(--primary-color);
          text-decoration: none;
        }

        .full-width {
          width: 100%;
        }

        .success {
          background: #efe;
          color: var(--success-color);
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;