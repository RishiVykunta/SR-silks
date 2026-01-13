// Helper to parse request body for Vercel serverless functions
function parseBody(req) {
  if (!req.body) return {};
  
  // If body is already an object, return it
  if (typeof req.body === 'object') {
    return req.body;
  }
  
  // If body is a string, try to parse it
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (e) {
      return {};
    }
  }
  
  return {};
}

// Helper to get query parameters
function getQuery(req) {
  return req.query || {};
}

module.exports = {
  parseBody,
  getQuery
};
