import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WishlistProvider } from './contexts/WishlistContext';

import Header from './components/Header';
import Footer from './components/Footer';
import WishlistSidebar from './components/WishlistSidebar';

import Home from './pages/Home';
import Products from './pages/Products';
import Collection from './pages/Collection';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProducts from './pages/Admin/Products';
import AdminOrders from './pages/Admin/Orders';
import AdminUsers from './pages/Admin/Users';
import ProductForm from './pages/Admin/ProductForm';

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <Router>
          <div className="App">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/collection/:collectionName" element={<Collection />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/products/new" element={<ProductForm />} />
                <Route path="/admin/products/:id/edit" element={<ProductForm />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/users" element={<AdminUsers />} />
              </Routes>
            </main>
            <Footer />
            <WishlistSidebar />
          </div>
        </Router>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;