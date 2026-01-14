const { runHandler } = require('../handlers/_lib/vercel-adapter');

function notFound(req, res) {
  return res.status(404).json({ error: 'Not found', path: req.url });
}

module.exports = async (req, res) => {
  // Get the path from URL
  const urlPath = req.url.split('?')[0];
  const path = req.path || urlPath;
  
  // Remove /api prefix
  const apiPath = path.replace(/^\/api/, '') || '/';
  const segments = apiPath.split('/').filter(s => s);
  
  console.log('API Router:', { path, apiPath, segments, url: req.url });
  
  let handler;
  
  // Route based on first segment
  if (segments.length === 0) {
    // /api - not found
    return notFound(req, res);
  }
  
  const firstSegment = segments[0];
  const restSegments = segments.slice(1);
  const routeKey = restSegments.join('/');
  
  try {
    switch (firstSegment) {
      case 'health':
        handler = require('./health');
        break;
        
      case 'init-db':
        handler = require('./init-db');
        break;
        
      case 'admin':
        // /api/admin/login, /api/admin/dashboard, etc.
        if (routeKey === 'login') {
          handler = require('../handlers/auth/admin/login');
        } else if (routeKey === 'dashboard') {
          handler = require('../handlers/admin/dashboard');
        } else if (routeKey === 'products') {
          handler = require('../handlers/admin/products/index');
        } else if (routeKey === 'orders') {
          handler = require('../handlers/admin/orders/index');
        } else if (routeKey === 'users') {
          handler = require('../handlers/admin/users/index');
        } else if (restSegments.length === 2 && restSegments[0] === 'products' && restSegments[1]) {
          req.query = { ...(req.query || {}), id: restSegments[1] };
          handler = require('../handlers/admin/products/[id]');
        } else if (restSegments.length === 3 && restSegments[0] === 'products' && restSegments[2] === 'toggle-status') {
          req.query = { ...(req.query || {}), id: restSegments[1] };
          handler = require('../handlers/admin/products/[id]/toggle-status');
        } else if (restSegments.length === 2 && restSegments[0] === 'orders' && restSegments[1]) {
          req.query = { ...(req.query || {}), id: restSegments[1] };
          handler = require('../handlers/admin/orders/[id]');
        } else if (restSegments.length === 3 && restSegments[0] === 'orders' && restSegments[2] === 'status') {
          req.query = { ...(req.query || {}), id: restSegments[1] };
          handler = require('../handlers/admin/orders/[id]/status');
        } else if (restSegments.length === 2 && restSegments[0] === 'users' && restSegments[1]) {
          req.query = { ...(req.query || {}), id: restSegments[1] };
          handler = require('../handlers/admin/users/[id]');
        } else {
          return notFound(req, res);
        }
        break;
        
      case 'auth':
        // /api/auth/login, /api/auth/register, etc.
        if (routeKey === 'login') {
          handler = require('../handlers/auth/login');
        } else if (routeKey === 'register') {
          handler = require('../handlers/auth/register');
        } else if (routeKey === 'profile') {
          handler = require('../handlers/auth/profile');
        } else if (routeKey === 'forgot-password' || routeKey === 'forgot_password') {
          handler = require('../handlers/auth/forgot-password');
        } else {
          return notFound(req, res);
        }
        break;
        
      case 'products':
        // /api/products, /api/products/new-arrivals, /api/products/:id
        if (routeKey === '') {
          handler = require('../handlers/products/index');
        } else if (routeKey === 'new-arrivals') {
          handler = require('../handlers/products/new-arrivals');
        } else if (routeKey === 'celebrate') {
          handler = require('../handlers/products/celebrate');
        } else if (routeKey === 'categories/list') {
          handler = require('../handlers/products/categories/list');
        } else if (restSegments.length === 1) {
          req.query = { ...(req.query || {}), id: restSegments[0] };
          handler = require('../handlers/products/[id]');
        } else {
          return notFound(req, res);
        }
        break;
        
      case 'cart':
        // /api/cart, /api/cart/add, etc.
        if (routeKey === '') {
          handler = require('../handlers/cart/index');
        } else if (routeKey === 'add') {
          handler = require('../handlers/cart/add');
        } else if (routeKey === 'clear') {
          handler = require('../handlers/cart/clear');
        } else if (routeKey === 'count') {
          handler = require('../handlers/cart/count');
        } else if (restSegments.length === 2 && restSegments[0] === 'update' && restSegments[1]) {
          req.query = { ...(req.query || {}), id: restSegments[1] };
          handler = require('../handlers/cart/update/[id]');
        } else if (restSegments.length === 2 && restSegments[0] === 'remove' && restSegments[1]) {
          req.query = { ...(req.query || {}), id: restSegments[1] };
          handler = require('../handlers/cart/remove/[id]');
        } else {
          return notFound(req, res);
        }
        break;
        
      case 'wishlist':
        // /api/wishlist, /api/wishlist/toggle, etc.
        if (routeKey === '') {
          handler = require('../handlers/wishlist/index');
        } else if (routeKey === 'toggle') {
          handler = require('../handlers/wishlist/toggle');
        } else if (routeKey === 'count') {
          handler = require('../handlers/wishlist/count');
        } else if (restSegments.length === 2 && restSegments[0] === 'remove' && restSegments[1]) {
          req.query = { ...(req.query || {}), id: restSegments[1] };
          handler = require('../handlers/wishlist/remove/[id]');
        } else {
          return notFound(req, res);
        }
        break;
        
      case 'orders':
        // /api/orders, /api/orders/user
        if (routeKey === '') {
          handler = require('../handlers/orders/index');
        } else if (routeKey === 'user') {
          handler = require('../handlers/orders/user');
        } else {
          return notFound(req, res);
        }
        break;
        
      case 'upload':
        // /api/upload/image, /api/upload/images
        if (routeKey === 'image') {
          handler = require('../handlers/upload/image');
        } else if (routeKey === 'images') {
          handler = require('../handlers/upload/images');
        } else if (restSegments.length === 2 && restSegments[0] === 'image' && restSegments[1]) {
          req.query = { ...(req.query || {}), publicId: restSegments[1] };
          handler = require('../handlers/upload/image/[publicId]');
        } else {
          return notFound(req, res);
        }
        break;
        
      default:
        return notFound(req, res);
    }
    
    if (handler) {
      return runHandler(handler, req, res);
    }
    
    return notFound(req, res);
  } catch (error) {
    console.error('API Router Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
