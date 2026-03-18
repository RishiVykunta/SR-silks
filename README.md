<div align="center">
  <a href="https://labelbyswathireddy.com/">
    <h1>SR Silks / Label by Swathy Reddy</h1>
  </a>

  <p align="center">
    A premium full-stack e-commerce platform for exclusive designer sarees.
    <br />
    <a href="https://labelbyswathireddy.com/"><strong>Explore the Website »</strong></a>
    <br />
    <br />
  </p>
</div>

<!-- ABOUT THE PROJECT -->
## 🌟 About The Project

**SR Silks / Label by Swathy Reddy** is a specialized, high-performance E-Commerce platform built from the ground up to offer a seamless shopping journey for premium silk and designer sarees. Engineered with a robust full-stack architecture, it ensures a fast, secure, and beautiful user experience across all devices.

### ✨ Live At
**[https://labelbyswathireddy.com/](https://labelbyswathireddy.com/)**

### 💻 Built With
This project highlights a modern, scalable technology stack capable of handling high-traffic production environments:
* **Frontend:** React 18, React Router DOM, Context API
* **Backend:** Node.js, Vercel Serverless Functions
* **Database:** PostgreSQL (Neon Serverless Database)
* **Authentication:** Next-generation JWT Auth with OTP Verification
* **Cloud Storage:** Cloudinary (for optimized image delivery)
* **Styling:** Custom Vanilla CSS with CSS Variables and responsive design principles

---

## 🚀 Key Features

### 🛍️ Client Experience
- **Dynamic Product Discovery:** Advanced categorization (Silk, Banarasi, Designer, Bridal), dynamic search, and collection filters.
- **Rich Media & Interaction:** Smooth product detail pages featuring an interactive image carousel.
- **Frictionless Checkout:** Guest cart functionality, persistent user sessions, and wishlist toggling.
- **Secure Authentication:** Modern registration, login, and secure "Forgot Password" flow with OTP.
- **Mobile First:** Fully responsive design built to look stunning on mobile, tablet, and desktop screens.

### 🛡️ Admin & Analytics
- **Powerful Dashboard:** Comprehensive analytics to track store performance.
- **Advanced Product Management:** Full CRUD capabilities with Cloudinary integration for multiple product images.
- **Order Tracking:** Integrated order management interface to update and monitor fulfillment status.
- **User Management:** Admin oversight over registered users and their activities.

---

## 🛠️ Architecture Overview

The system architecture features a **decoupled structure**:
1. **Client App:** A single-page application (SPA) built with React that consumes RESTful APIs. It utilizes the Context API for comprehensive global state management (e.g., `AuthContext`, `WishlistContext`).
2. **Serverless API Layer:** Engineered on Vercel's serverless functions (`api/index.js`). These optimized routes securely handle operations ranging from cart management to secure Cloudinary uploads.
3. **Database Layer:** A powerful PostgreSQL relational database hosted on Neon, tailored for rapid connection spin-ups and consistently high availability.

---

## ⚙️ Quick Start (Local Setup)

Interested in running this project locally? Follow these concise steps:

### Prerequisites
* **Node.js:** v18 or a modern LTS version
* **Neon PostgreSQL:** A valid database connection string
* **Cloudinary:** Valid API keys for remote image management
* **Resend:** An API key for robust transactional email delivery

### Installation Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RishiVykunta/SR-silks.git
   cd SR-silks
   ```

2. **Install global and client-side dependencies:**
   ```bash
   npm run install-all
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the project's root directory:
   ```env
   DATABASE_URL=your_neon_postgresql_connection_string
   JWT_SECRET=your_jwt_secret_key_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=SR Silks <noreply@yourdomain.com>
   FRONTEND_URL=http://localhost:3000
   ```

4. **Initialize the Database Schema:**
   Run the scripts provided within `database-init.sql` directly in your Neon SQL editor to generate the necessary tables and structure.

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```

6. **Available Endpoints:**
   - **Frontend Application:** `http://localhost:3000`
   - **Backend API Routes:** `http://localhost:3000/api`

---

## 📞 Brand Identity & Support 

* **Business Identity:** Label by Swathy Reddy / Samala Swathy
* **Founder:** Swathy Reddy
* **Address:** Flats no 301&302, Sri Sai eDurga Castle, Naveen Nagar Colony, Road no 1 Banjara Hills, Hyderabad, Telangana, India (PIN 500034)
* **Phone & WhatsApp:** +91 9000360756 / +91 7569060926
* **Email:** Swathyreddy169@icloud.com
* **Instagram:** [@label_swathyreddy](https://www.instagram.com/label_swathyreddy?igsh=Z2tkYXVrYmpjNDRy&utm_source=qr)

---

<div align="center">
  <p><strong>Built with ❤️ for Label by Swathy Reddy</strong></p>
</div>
