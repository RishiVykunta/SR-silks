const cloudinary = require('cloudinary').v2;
const { authenticateAdmin } = require('../_lib/auth');
const { corsHeaders, handleCors } = require('../_lib/cors');
const Busboy = require('busboy');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function parseMultipartForm(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers || {} });
    const files = {};
    const fields = {};

    busboy.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      if (!files[name]) files[name] = [];
      
      const chunks = [];
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        files[name].push({
          buffer: Buffer.concat(chunks),
          filename,
          encoding,
          mimeType
        });
      });
    });

    busboy.on('field', (name, value) => {
      fields[name] = value;
    });

    busboy.on('finish', () => resolve({ files, fields }));
    busboy.on('error', reject);
    
    if (req.body) {
      if (Buffer.isBuffer(req.body)) {
        busboy.end(req.body);
      } else {
        busboy.end(Buffer.from(req.body));
      }
    } else {
      busboy.end();
    }
  });
}

module.exports = async (req, res) => {
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;
  if (req.method !== 'POST') return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const authResult = await authenticateAdmin(req);
    if (authResult.error) return { statusCode: authResult.error.status, headers: corsHeaders(), body: JSON.stringify({ error: authResult.error.message }) };

    const { files } = await parseMultipartForm(req);

    if (!files.images || files.images.length === 0) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'No image files provided' }) };
    }

    const uploadPromises = files.images.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'shanti-silk-house',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve({ url: result.secure_url, public_id: result.public_id });
          }
        );
        uploadStream.end(file.buffer);
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        message: 'Images uploaded successfully',
        images: uploadedImages
      })
    };
  } catch (error) {
    console.error('Images upload error:', error);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to upload images' }) };
  }
};
