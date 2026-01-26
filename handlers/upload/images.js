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
    let fileCount = 0;
    let finished = false;

    busboy.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      if (!files[name]) files[name] = [];
      fileCount++;
      
      // Validate file size (4MB max per file)
      let fileSize = 0;
      const maxSize = 4 * 1024 * 1024; // 4MB
      
      const chunks = [];
      file.on('data', (chunk) => {
        fileSize += chunk.length;
        if (fileSize > maxSize) {
          file.resume(); // Stop processing
          reject(new Error(`File ${filename} exceeds 4MB size limit`));
          return;
        }
        chunks.push(chunk);
      });
      
      file.on('end', () => {
        fileCount--;
        files[name].push({
          buffer: Buffer.concat(chunks),
          filename,
          encoding,
          mimeType,
          size: fileSize
        });
        
        // Check if all files are processed
        if (fileCount === 0 && finished) {
          resolve({ files, fields });
        }
      });
      
      file.on('error', (err) => {
        reject(err);
      });
    });

    busboy.on('field', (name, value) => {
      fields[name] = value;
    });

    busboy.on('finish', () => {
      finished = true;
      if (fileCount === 0) {
        resolve({ files, fields });
      }
    });
    
    busboy.on('error', reject);
    
    // Handle request body for Vercel serverless functions
    // Vercel provides req.body as a buffer or we need to read from the stream
    if (req.body) {
      if (Buffer.isBuffer(req.body)) {
        busboy.end(req.body);
      } else if (typeof req.body === 'string') {
        // Convert string to buffer (might be base64 encoded)
        try {
          const buffer = Buffer.from(req.body, req.isBase64Encoded ? 'base64' : 'binary');
          busboy.end(buffer);
        } catch (e) {
          busboy.end(Buffer.from(req.body));
        }
      } else {
        reject(new Error('Invalid request body format'));
      }
    } else if (req.on && typeof req.on === 'function') {
      // If req is a stream, pipe it
      req.pipe(busboy);
    } else {
      reject(new Error('No request body found'));
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

    // Validate total size (max 10MB total)
    const totalSize = files.images.reduce((sum, file) => sum + (file.size || file.buffer.length), 0);
    const maxTotalSize = 10 * 1024 * 1024; // 10MB
    if (totalSize > maxTotalSize) {
      return { 
        statusCode: 413, 
        headers: corsHeaders(), 
        body: JSON.stringify({ error: `Total file size exceeds 10MB limit. Please upload fewer or smaller images.` }) 
      };
    }

    const uploadPromises = files.images.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'shanti-silk-house',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }]
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve({ url: result.secure_url, public_id: result.public_id });
            }
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
    const errorMessage = error.message || 'Failed to upload images';
    const statusCode = errorMessage.includes('exceeds') ? 413 : 500;
    return { 
      statusCode, 
      headers: corsHeaders(), 
      body: JSON.stringify({ error: errorMessage }) 
    };
  }
};
