const bcrypt = require('bcryptjs');
const { query } = require('./_lib/db');
const { corsHeaders } = require('./_lib/cors');

module.exports = async function handler(req, res) {
  const send = (status, body) => res.status(status).set(corsHeaders()).json(body);


  // Log request for debugging
  console.log('Init DB request:', {
    method: req.method,
    url: req.url,
    path: req.path
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return send(200, { message: 'OK' });
  }

  // Allow both GET and POST for easier testing
  if (req.method !== 'POST' && req.method !== 'GET') {
    return send(405, { 
      error: 'Method not allowed',
      received: req.method,
      allowed: ['GET', 'POST']
    });
  }

  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return send(500, { 
        error: 'DATABASE_URL environment variable is not set',
        message: 'Please set DATABASE_URL in your Vercel environment variables'
      });
    }

    // Test database connection
    await query('SELECT NOW()');

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create admins table
    await query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create products table
    await query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        discount_price DECIMAL(10, 2),
        category VARCHAR(100),
        occasion_type VARCHAR(100),
        collection_name VARCHAR(100),
        images TEXT[],
        size VARCHAR(50)[],
        color VARCHAR(50)[],
        material VARCHAR(100),
        features TEXT[],
        specifications JSONB,
        shipping_info TEXT,
        stock INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        is_new_arrival BOOLEAN DEFAULT false,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add occasion_type column if it doesn't exist
    await query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='products' AND column_name='occasion_type'
        ) THEN
          ALTER TABLE products ADD COLUMN occasion_type VARCHAR(100);
        END IF;
      END $$;
    `);

    // Create cart table
    await query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        size VARCHAR(50),
        color VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id, size, color)
      )
    `);

    // Create wishlist table
    await query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);

    // Create orders table
    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        total_amount DECIMAL(10, 2) NOT NULL,
        shipping_amount DECIMAL(10, 2) DEFAULT 0,
        subtotal DECIMAL(10, 2) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address_line1 VARCHAR(255) NOT NULL,
        address_line2 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        country VARCHAR(100) DEFAULT 'India',
        payment_method VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create order_items table
    await query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        product_name VARCHAR(255) NOT NULL,
        product_image VARCHAR(255),
        price DECIMAL(10, 2) NOT NULL,
        quantity INTEGER NOT NULL,
        size VARCHAR(50),
        color VARCHAR(50),
        subtotal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create or update default admin account
    const adminEmail = 'srsilks@gmail.com';
    const adminCheck = await query('SELECT * FROM admins WHERE email = $1', [adminEmail]);
    
    let adminCreated = false;
    if (adminCheck.rows.length === 0) {
      // Check if old admin exists and update it, or create new one
      const oldAdminCheck = await query('SELECT * FROM admins WHERE email = $1', ['admin@shantisilkhouse.com']);
      
      if (oldAdminCheck.rows.length > 0) {
        // Update existing admin email
        await query(
          'UPDATE admins SET email = $1, name = $2 WHERE email = $3',
          [adminEmail, 'Admin', 'admin@shantisilkhouse.com']
        );
        adminCreated = true;
      } else {
        // Create new admin account
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await query(
          'INSERT INTO admins (email, password, name) VALUES ($1, $2, $3)',
          [adminEmail, hashedPassword, 'Admin']
        );
        adminCreated = true;
      }
    }

    return send(200, {
      message: 'Database initialized successfully',
      tables: ['users', 'admins', 'products', 'cart', 'wishlist', 'orders', 'order_items'],
      admin: {
        email: adminEmail,
        password: adminCreated ? 'admin123' : 'already exists',
        created: adminCreated
      }
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return send(500, { 
      error: 'Database initialization failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
