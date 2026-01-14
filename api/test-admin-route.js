const { corsHeaders, handleCors } = require('./_lib/cors');

module.exports = async (req, res) => {
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({
      message: 'Test endpoint works',
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      body: req.body
    })
  };
};
