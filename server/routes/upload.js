const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shanti-silk-house',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
  }
});

const upload = multer({ storage: storage });

// All upload routes require admin authentication
router.use(authenticateAdmin);

// Upload single image
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    res.json({
      message: 'Image uploaded successfully',
      url: req.file.path,
      public_id: req.file.filename
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload multiple images
router.post('/images', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const uploadedImages = req.files.map(file => ({
      url: file.path,
      public_id: file.filename
    }));

    res.json({
      message: 'Images uploaded successfully',
      images: uploadedImages
    });
  } catch (error) {
    console.error('Images upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// Delete image from Cloudinary
router.delete('/image/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Extract public_id from URL if full URL is provided
    const public_id = publicId.includes('/') 
      ? publicId.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '')
      : publicId;

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok' || result.result === 'not found') {
      res.json({
        message: 'Image deleted successfully',
        result: result.result
      });
    } else {
      res.status(400).json({ error: 'Failed to delete image' });
    }
  } catch (error) {
    console.error('Image delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;