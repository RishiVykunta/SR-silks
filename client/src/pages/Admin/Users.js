import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';

const AdminUsers = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    loadUsers();
  }, [isAdmin, navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewUserDetails = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      setSelectedUser(response.data);
    } catch (error) {
      alert('Failed to load user details');
    }
  };

  if (!isAdmin) return null;
  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1>Manage Users</h1>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.first_name || ''} {user.last_name || ''}</td>
                  <td>{user.phone || '-'}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-outline"
                      onClick={() => viewUserDetails(user.id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="user-modal" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>User Details</h2>
            <div className="user-details">
              <div>
                <p><strong>Email:</strong> {selectedUser.user?.email}</p>
                <p><strong>Name:</strong> {selectedUser.user?.first_name} {selectedUser.user?.last_name}</p>
                <p><strong>Phone:</strong> {selectedUser.user?.phone || '-'}</p>
                <p><strong>Joined:</strong> {new Date(selectedUser.user?.created_at).toLocaleString()}</p>
              </div>
              <div>
                <h3>Statistics</h3>
                <p><strong>Total Orders:</strong> {selectedUser.stats?.totalOrders || 0}</p>
                <p><strong>Total Spent:</strong> ₹{selectedUser.stats?.totalSpent || '0.00'}</p>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setSelectedUser(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        .users-table {
          background: white;
          border-radius: 8px;
          box-shadow: var(--shadow);
          overflow-x: auto;
          margin-top: 2rem;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }

        th {
          background: var(--light-color);
          font-weight: 600;
        }

        .user-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 2rem;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          max-width: 600px;
          width: 100%;
        }

        .user-details {
          margin: 2rem 0;
        }

        .user-details p {
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default AdminUsers;