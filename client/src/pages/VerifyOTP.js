import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const VerifyOTP = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyOTP, resendOTP } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await verifyOTP(email, code);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Verification failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    try {
      const result = await resendOTP(email);
      if (result.success) {
        setMessage('A new verification code has been sent to your email.');
      } else {
        setError(result.error || 'Failed to resend code');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="auth-page container" style={{ padding: '4rem 0', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Verify Your Email</h1>
      <div className="auth-form">
        <p>We've sent a 6-digit verification code to <strong>{email}</strong>. Please enter it below to complete your registration.</p>
        
        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Verification Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              required
              style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
            />
          </div>

          <button type="submit" className="btn btn-primary full-width" disabled={loading || code.length !== 6}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="auth-links" style={{ flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          <span>Didn't receive the code? <button onClick={handleResend} className="btn-link" style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: 0, font: 'inherit' }}>Resend Code</button></span>
          <Link to="/login">Back to Login</Link>
        </div>
      </div>

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
        }
        .error {
          background: #fee;
          color: var(--error-color);
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        .success {
          background: #efe;
          color: #2e7d32;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        .full-width {
          width: 100%;
        }
        .auth-links {
          text-align: center;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default VerifyOTP;
