// CORS headers for Vercel serverless functions
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function handleCors(req, res) {
  if (req.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ message: 'OK' })
    };
  }
  return null;
}

module.exports = {
  corsHeaders,
  handleCors
};

