const { corsHeaders, handleCors } = require('./_lib/cors');
const { query } = require('./_lib/db');

module.exports = async (req, res) => {
  // Handle CORS
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;

  try {
    // Test database connection
    await query('SELECT NOW()');
    
    // Check if tables exist
    const tablesCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'admins', 'products')
    `);
    
    const existingTables = tablesCheck.rows.map(row => row.table_name);
    const missingTables = ['users', 'admins', 'products'].filter(t => !existingTables.includes(t));
    
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ 
        status: 'OK', 
        message: 'Server is running',
        database: {
          connected: true,
          tables: {
            existing: existingTables,
            missing: missingTables.length > 0 ? missingTables : null
          },
          initialized: missingTables.length === 0
        },
        environment: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          hasJwtSecret: !!process.env.JWT_SECRET,
          hasCloudinary: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)
        }
      })
    };
  } catch (error) {
    console.error('Health check error:', error);
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ 
        status: 'OK', 
        message: 'Server is running',
        database: {
          connected: false,
          error: error.message,
          initialized: false
        },
        environment: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          hasJwtSecret: !!process.env.JWT_SECRET,
          hasCloudinary: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)
        },
        note: 'Database connection failed. Please check your DATABASE_URL environment variable.'
      })
    };
  }
};
