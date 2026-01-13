const cloudinary = require('cloudinary').v2;
const { authenticateAdmin } = require('../../_lib/auth');
const { corsHeaders, handleCors } = require('../../_lib/cors');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = async (req, res) => {
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;
  if (req.method !== 'DELETE') return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const authResult = await authenticateAdmin(req);
    if (authResult.error) return { statusCode: authResult.error.status, headers: corsHeaders(), body: JSON.stringify({ error: authResult.error.message }) };

    const { publicId } = req.query;
    
    // Extract public_id from URL if full URL is provided
    const public_id = publicId.includes('/') 
      ? publicId.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '')
      : publicId;

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok' || result.result === 'not found') {
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({
          message: 'Image deleted successfully',
          result: result.result
        })
      };
    } else {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to delete image' }) };
    }
  } catch (error) {
    console.error('Image delete error:', error);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to delete image' }) };
  }
};
