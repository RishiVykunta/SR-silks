const { corsHeaders, handleCors } = require('./_lib/cors');

module.exports = async (req, res) => {
  // Handle CORS
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({ status: 'OK', message: 'Server is running' })
  };
};
