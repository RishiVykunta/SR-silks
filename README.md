# SR Silks / Label by Swathy Reddy - E-commerce Website

A complete full-stack e-commerce website for designer sarees built with React frontend and Vercel serverless functions, using Neon PostgreSQL database.

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
- Node.js (Vercel Serverless Functions)
- PostgreSQL (Neon)
- JWT for authentication
- Bcrypt for password hashing
- Cloudinary for image storage

## Quick Start (Local Development)

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Neon PostgreSQL database account
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   cd "SR Silks"
   cd SR-silks
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_neon_postgresql_connection_string
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=SR Silks <noreply@yourdomain.com>
   FRONTEND_URL=https://sr-silks.vercel.app
   ```
   
   **Note**: For password reset emails to work, you need to set up Resend (see Password Reset Setup below).

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3000/api
   - Admin Panel: http://localhost:3000/admin

## Deployment Guide

### Step 1: Create Neon PostgreSQL Database

1. **Sign up for Neon**
   - Go to [https://neon.tech](https://neon.tech)
   - Click "Sign Up" and create a free account
   - You can sign up with GitHub, Google, or email

2. **Create a New Project**
   - After logging in, click "Create Project"
   - Choose a project name (e.g., "sr-silks")
   - Select a region closest to your users
   - Choose PostgreSQL version (latest recommended)
   - Click "Create Project"

3. **Get Connection String**
   - Once the project is created, you'll see a connection string
   - It looks like: `postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require`
   - **Important**: Copy this connection string - you'll need it for Vercel

4. **Initialize Database**
   - Click on "SQL Editor" in the Neon dashboard
   - Copy the contents of `database-init.sql` from this project
   - Paste and run it in the SQL Editor
   - Alternatively, after deploying to Vercel, call `/api/init-db` endpoint to auto-initialize

### Step 2: Deploy to Vercel

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy the Project**
   ```bash
   cd "SR Silks/SR-silks"
   vercel
   ```
   - Follow the prompts
   - When asked "Set up and deploy?", choose **Yes**
   - When asked "Which scope?", select your account
   - When asked "Link to existing project?", choose **No** (for first deployment)
   - When asked "What's your project's name?", enter a name (e.g., "sr-silks")
   - When asked "In which directory is your code located?", press Enter (current directory)

4. **Set Environment Variables in Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project
   - Go to **Settings** → **Environment Variables**
   - Add the following variables:

   ```
   DATABASE_URL = (your Neon connection string)
   JWT_SECRET = (generate a strong random string, minimum 32 characters)
   JWT_EXPIRES_IN = 7d
   CLOUDINARY_CLOUD_NAME = (your Cloudinary cloud name)
   CLOUDINARY_API_KEY = (your Cloudinary API key)
   CLOUDINARY_API_SECRET = (your Cloudinary API secret)
   ```

   **Important**: 
   - Make sure to add these for **Production**, **Preview**, and **Development** environments
   - After adding variables, you need to **redeploy** for them to take effect

5. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```
   Or trigger a redeploy from the Vercel dashboard:
   - Go to **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Click **Redeploy**

6. **Initialize Database After Deployment**
   - Once deployed, visit: `https://your-app.vercel.app/api/init-db`
   - This will create all tables and set up the default admin account
   - Default admin credentials:
     - Email: `srsilks@gmail.com`
     - Password: `admin123`
   - **Important**: Change the admin password after first login!

### Step 3: Verify Deployment

1. **Check Health Endpoint**
   - Visit: `https://your-app.vercel.app/api/health`
   - Should show database connection status

2. **Test Admin Login**
   - Visit: `https://your-app.vercel.app/admin`
   - Login with default credentials
   - Change password immediately

3. **Test Frontend**
   - Visit: `https://your-app.vercel.app`
   - Browse products, test registration, etc.

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Yes | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Secret key for JWT token signing | Yes | Random 32+ character string |
| `JWT_EXPIRES_IN` | JWT token expiration time | No | `7d` (default) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes | Your Cloudinary API secret |
| `RESEND_API_KEY` | Resend API key for email sending | Yes (for password reset) | Your Resend API key |
| `RESEND_FROM_EMAIL` | Email address for sending emails | Yes (for password reset) | `SR Silks <noreply@yourdomain.com>` |
| `FRONTEND_URL` | Frontend URL for reset links | Yes (for password reset) | `https://sr-silks.vercel.app` |
| `REACT_APP_API_URL` | API URL for React app (local dev only) | No | `http://localhost:5000/api` |

## Password Reset Setup (Forgot Password Feature)

The forgot password feature uses [Resend](https://resend.com) for sending password reset emails. Resend offers a free tier with 100 emails per day, which is perfect for Vercel Hobby plan.

### Step 1: Create Resend Account

1. **Sign up for Resend**
   - Go to [https://resend.com](https://resend.com)
   - Click "Sign Up" and create a free account
   - Verify your email address

2. **Get Your API Key**
   - After logging in, go to **API Keys** in the dashboard
   - Click **Create API Key**
   - Give it a name (e.g., "SR Silks Production")
   - Copy the API key (you'll only see it once!)

3. **Add Domain (Optional but Recommended)**
   - Go to **Domains** in the dashboard
   - Click **Add Domain**
   - Follow the DNS setup instructions to verify your domain
   - This allows you to send from `noreply@yourdomain.com` instead of `onboarding@resend.dev`

### Step 2: Configure Environment Variables

Add these to your Vercel environment variables:

```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=SR Silks <noreply@yourdomain.com>
FRONTEND_URL=https://sr-silks.vercel.app
```

**Note**: 
- If you haven't set up a custom domain with Resend, use `onboarding@resend.dev` as the `RESEND_FROM_EMAIL`
- The `FRONTEND_URL` should match your Vercel deployment URL

### Step 3: Test Password Reset

1. **Redeploy your application** after adding the environment variables
2. **Test the flow**:
   - Go to `/forgot-password` page
   - Enter a registered user's email
   - Check the email inbox for the reset link
   - Click the link and reset the password

### How It Works

1. User requests password reset at `/forgot-password`
2. System generates a secure token and stores it in the database (expires in 1 hour)
3. Email is sent via Resend with a reset link
4. User clicks the link and is taken to `/reset-password?token=...`
5. User enters new password
6. Password is updated and reset token is cleared

**Security Features**:
- Tokens expire after 1 hour
- Tokens are cryptographically secure (32-byte random)
- Tokens are single-use (cleared after password reset)
- Invalid/expired tokens are rejected

## Project Structure

```
SR-silks/
├── api/                    # Vercel serverless functions
│   ├── admin/             # Admin API routes
│   ├── auth/              # Authentication routes
│   ├── cart/              # Cart routes
│   ├── orders/            # Order routes
│   ├── products/          # Product routes
│   ├── upload/            # Image upload routes
│   ├── wishlist/          # Wishlist routes
│   ├── health.js          # Health check endpoint
│   └── init-db.js         # Database initialization endpoint
│
├── handlers/              # Handler functions for API routes
│   ├── _lib/              # Shared utilities (db, auth, cors)
│   ├── admin/             # Admin handlers
│   ├── auth/              # Auth handlers
│   ├── cart/              # Cart handlers
│   ├── orders/            # Order handlers
│   ├── products/          # Product handlers
│   ├── upload/            # Upload handlers
│   └── wishlist/          # Wishlist handlers
│
├── client/                # React frontend application
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts (Auth, Wishlist)
│   │   ├── pages/        # Page components
│   │   ├── config/       # Configuration files
│   │   └── App.js        # Main app component
│   └── package.json
│
├── database-init.sql      # Database schema (reference)
├── vercel.json           # Vercel configuration
├── package.json          # Root dependencies
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/profile` - Get user profile (authenticated)
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/reset-password` - Verify reset token
- `POST /api/auth/reset-password` - Reset password with token

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
- `POST /api/wishlist/toggle` - Toggle wishlist item
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

### Utility
- `GET /api/health` - Health check and database status
- `GET /api/init-db` - Initialize database (run once after deployment)

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

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correctly set in Vercel
- Ensure connection string includes `?sslmode=require`
- Check Neon dashboard for connection limits
- Verify database is not paused (Neon free tier pauses after inactivity)

### Build Failures
- Ensure all dependencies are in `package.json`
- Check Node.js version (requires >=18.x)
- Review build logs in Vercel dashboard

### API Errors
- Check environment variables are set correctly
- Verify database tables are initialized (`/api/init-db`)
- Review function logs in Vercel dashboard

## Brand Information

- **Business Name:** Label by Swathy Reddy / Samala Swathy
- **Founder:** Swathy Reddy
- **Address:** Flats no 301&302, Sri Sai eDurga castle, Naveen nagar colony, Road no 1 Banjarahills, Hyderabad, PIN code 500034, Telangana, India
- **Phone:** 7569060926
- **WhatsApp:** 9000360756
- **Email:** Swathyreddy169@icloud.com
- **Instagram:** [@label_swathyreddy](https://www.instagram.com/label_swathyreddy?igsh=Z2tkYXVrYmpjNDRy&utm_source=qr)
- **Domain:** labelbyswathyreddy.com

## Support

For issues or questions, please contact:
- Email: Swathyreddy169@icloud.com
- WhatsApp: 9000360756

## License

This project is proprietary and confidential.

---

**Built with ❤️ for Label by Swathy Reddy**
