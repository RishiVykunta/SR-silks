# Shanti Silk House /  E-commerce Website

A complete full-stack e-commerce website for designer sarees built with React frontend and Express.js backend, using Neon PostgreSQL database.

## Features

### Customer Features
- Product browsing and search
- Category filtering (Silk, Banarasi, Designer, Bridal)
- Product detail pages with image carousel
- Shopping cart (guest and authenticated users)
- Wishlist functionality
- User authentication and registration
- Checkout process
- Order placement
- Responsive design for mobile, tablet, and desktop

### Admin Features
- Admin dashboard with analytics
- Product management (CRUD operations)
- Order management and status updates
- User management
- Image upload using Cloudinary
- Product status toggle

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios for API calls
- Heroicons for icons
- CSS with CSS Variables

### Backend
- Node.js
- Express.js
- PostgreSQL (Neon)
- JWT for authentication
- Bcrypt for password hashing
- Cloudinary for image storage
- Multer for file uploads

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Neon PostgreSQL database account
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   cd "shanthi silk house"
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

5. **Configure environment variables**

   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL=your_neon_postgresql_connection_string
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d

   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

   Create a `.env` file in the `client` directory (optional):
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

6. **Initialize the database**
   The database tables will be automatically created when you start the server for the first time.

   Default admin credentials:
   - Email: `srsilks@gmail.com`
   - Password: `admin123`

7. **Start the development servers**

   From the root directory:
   ```bash
   npm run dev
   ```

   Or start them separately:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm start
   ```

8. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin Panel: http://localhost:3000/admin

## Brand Information

- **Business Name:** Label by Swathy Reddy / Samala Swathy
- **Founder:** Swathy Reddy
- **Address:** Flats no 301&302, Sri Sai eDurga castle, Naveen nagar colony, Road no 1 Banjarahills, Hyderabad, PIN code 500034, Telangana, India
- **Phone:** 7569060926
- **WhatsApp:** 9000360756
- **Email:** Swathyreddy169@icloud.com
- **Instagram:** [@label_swathyreddy](https://www.instagram.com/label_swathyreddy?igsh=Z2tkYXVrYmpjNDRy&utm_source=qr)
- **Domain:** labelbyswathyreddy.com

## Project Structure

```
shanthi-silk-house/
├── server/                 # Backend Express.js application
│   ├── config/            # Database configuration
│   ├── middleware/        # Authentication middleware
│   ├── routes/            # API routes
│   │   ├── auth.js       # Authentication routes
│   │   ├── products.js   # Product routes
│   │   ├── cart.js       # Cart routes
│   │   ├── wishlist.js   # Wishlist routes
│   │   ├── orders.js     # Order routes
│   │   ├── admin.js      # Admin routes
│   │   └── upload.js     # Image upload routes
│   └── index.js          # Server entry point
│
├── client/                # Frontend React application
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts (Auth, Cart, Wishlist)
│   │   ├── pages/        # Page components
│   │   ├── config/       # Configuration files
│   │   └── App.js        # Main app component
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/profile` - Get user profile (authenticated)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/new-arrivals` - Get new arrivals
- `GET /api/products/celebrate` - Get celebrate collection
- `GET /api/products/categories/list` - Get all categories
- `GET /api/products/:id` - Get single product

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:id` - Update cart item
- `DELETE /api/cart/remove/:id` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart
- `GET /api/cart/count` - Get cart count

### Wishlist
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist/add` - Add to wishlist
- `POST /api/wishlist/toggle` - Toggle wishlist item
- `DELETE /api/wishlist/remove/:id` - Remove from wishlist
- `GET /api/wishlist/count` - Get wishlist count

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/user` - Get user orders

### Admin
- `GET /api/admin/dashboard` - Get dashboard analytics
- `GET /api/admin/products` - Get all products (admin)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `PUT /api/admin/products/:id/toggle-status` - Toggle product status
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/:id` - Get order details
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user details

### Upload
- `POST /api/upload/image` - Upload single image
- `POST /api/upload/images` - Upload multiple images
- `DELETE /api/upload/image/:publicId` - Delete image

## Database Schema

### Tables
- `users` - User accounts
- `admins` - Admin accounts
- `products` - Product catalog
- `cart` - Shopping cart items
- `wishlist` - Wishlist items
- `orders` - Order records
- `order_items` - Order line items

## Features in Detail

### Free Shipping
- Free shipping threshold: ₹5,000
- Shipping cost: ₹200 (below threshold)
- Progress indicator in cart

### Product Features
- Multiple images per product
- Size and color variations
- Price discounts
- Stock management
- Product categories and collections
- New arrivals and featured products

### User Experience
- Guest cart (localStorage)
- Persistent sessions
- Responsive design
- Loading states
- Error handling
- Form validation

## Deployment

### Backend Deployment
1. Set environment variables in your hosting platform
2. Ensure DATABASE_URL points to your Neon PostgreSQL instance
3. Deploy to platforms like Heroku, Railway, or Render

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy the `build` folder to platforms like:
   - Netlify
   - Vercel
   - AWS S3 + CloudFront

### Database
- The application uses Neon PostgreSQL
- Tables are automatically created on first run
- Make sure your DATABASE_URL is correctly configured

## Support

For issues or questions, please contact:
- Email: Swathyreddy169@icloud.com
- WhatsApp: 9000360756

## License

This project is proprietary and confidential.

---

**Built with ❤️ for Label by Swathy Reddy**