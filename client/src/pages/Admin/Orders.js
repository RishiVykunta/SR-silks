import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';

const AdminOrders = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [isAdmin, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      alert('Failed to update order status');
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await api.get(`/admin/orders/${orderId}`);
      setSelectedOrder(response.data.order);
    } catch (error) {
      alert('Failed to load order details');
    }
  };

  if (!isAdmin) return null;
  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1>Manage Orders</h1>

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td>{order.email || order.first_name + ' ' + order.last_name}</td>
                  <td>₹{order.total_amount}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className={`status-select status-${order.status}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-outline"
                      onClick={() => viewOrderDetails(order.id)}
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

      {selectedOrder && (
        <div className="order-modal" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Order Details: {selectedOrder.order_number}</h2>
            <div className="order-details">
              <div>
                <h3>Customer Information</h3>
                <p>Name: {selectedOrder.first_name} {selectedOrder.last_name}</p>
                <p>Email: {selectedOrder.email}</p>
                <p>Phone: {selectedOrder.phone}</p>
              </div>
              <div>
                <h3>Shipping Address</h3>
                <p>{selectedOrder.address_line1}</p>
                {selectedOrder.address_line2 && <p>{selectedOrder.address_line2}</p>}
                <p>{selectedOrder.city}, {selectedOrder.state} {selectedOrder.postal_code}</p>
                <p>{selectedOrder.country}</p>
              </div>
              <div>
                <h3>Order Items</h3>
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="order-item">
                    <img src={item.product_image || '/placeholder.jpg'} alt={item.product_name} />
                    <div>
                      <p>{item.product_name}</p>
                      <p>Qty: {item.quantity} × ₹{item.price} = ₹{item.subtotal}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h3>Order Summary</h3>
                <p>Subtotal: ₹{selectedOrder.subtotal}</p>
                <p>Shipping: ₹{selectedOrder.shipping_amount}</p>
                <p><strong>Total: ₹{selectedOrder.total_amount}</strong></p>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setSelectedOrder(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        .orders-table {
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

        .status-select {
          padding: 5px 10px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          cursor: pointer;
        }

        .order-modal {
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
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          width: 100%;
        }

        .order-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin: 2rem 0;
        }

        .order-item {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .order-item img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default AdminOrders;