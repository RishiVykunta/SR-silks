import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    loadDashboard();
  }, [isAdmin, navigate]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;
  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!analytics) return <div className="error">Failed to load dashboard</div>;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1>Admin Dashboard</h1>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{analytics.totalUsers || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-number">{analytics.totalProducts || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-number">{analytics.totalOrders || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-number">₹{analytics.totalRevenue || '0.00'}</p>
        </div>
        <div className="stat-card">
          <h3>Average Order Value</h3>
          <p className="stat-number">₹{analytics.avgOrderValue || '0.00'}</p>
        </div>
      </div>

      <div className="dashboard-links">
        <Link to="/admin/products" className="btn btn-primary">Manage Products</Link>
        <Link to="/admin/orders" className="btn btn-primary">Manage Orders</Link>
        <Link to="/admin/users" className="btn btn-primary">Manage Users</Link>
      </div>

      <style>{`
        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin: 2rem 0;
        }

        .stat-card {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: var(--shadow);
          text-align: center;
        }

        .stat-card h3 {
          color: var(--text-light);
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 600;
          color: var(--primary-color);
          margin: 0;
        }

        .dashboard-links {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        @media (max-width: 768px) {
          .dashboard-links {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;