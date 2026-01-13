import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', remember: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if it's admin email
      const isAdminEmail = formData.email.toLowerCase().trim() === 'srsilks@gmail.com';
      const result = isAdminEmail
        ? await adminLogin(formData.email, formData.password)
        : await login(formData.email, formData.password);

      if (result.success) {
        if (isAdminEmail) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page container" style={{ padding: '4rem 0', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="error">{error}</div>}
        
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label>Password *</label>
          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
            />
            Remember me
          </label>
        </div>

        <button type="submit" className="btn btn-primary full-width" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="auth-links">
          <Link to="/forgot-password">Forgot Password?</Link>
          <span>Don't have an account? <Link to="/register">Register</Link></span>
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

        .form-group input[type="text"],
        .form-group input[type="email"],
        .form-group input[type="password"] {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          font-size: 16px;
        }

        .password-input {
          position: relative;
        }

        .password-input input {
          padding-right: 50px;
        }

        .password-toggle {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 20px;
        }

        .auth-links {
          display: flex;
          justify-content: space-between;
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

        .error {
          background: #fee;
          color: var(--error-color);
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default Login;