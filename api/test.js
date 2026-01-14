module.exports = async (req, res) => {
  return res.status(200).json({ 
    message: 'API test endpoint works!',
    url: req.url,
    method: req.method,
    query: req.query,
    timestamp: new Date().toISOString()
  });
};
