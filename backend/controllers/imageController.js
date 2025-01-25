// filepath: /F:/Wifi passes/R-studios/backend/controllers/imageController.js
import Image from '../models/imageModel.js';
// import cloudinary from '../config/cloudinary.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
// Save image URL to the database
export const saveImage = async (req, res) => {
  try {
    const { url } = req.body;
    const image = new Image({ url });
    await image.save();
    res.status(201).json({ success: true, image });
  } catch (error) {
    console.error('Error saving image:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all images
export const getImages = async (req, res) => {
  try {
    const images = await Image.find();
    res.status(200).json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete an image
// Delete an image
export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log('Attempting to delete image with ID:', id);

    const image = await Image.findById(id);
    if (!image) {
      console.log('Image not found in database');
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    // Extract public ID from Cloudinary URL
    // Example URL: https://res.cloudinary.com/dp7gtidih/image/upload/v1737737694/gjxcdpvjf1chzny3pdd2.jpg
    const urlParts = image.url.split('/');
    const publicId = urlParts[urlParts.length - 1].split('.')[0];
    // console.log('Public ID for deletion:', publicId);

    try {
      const cloudinaryResult = await cloudinary.uploader.destroy(publicId);
      // console.log('Cloudinary deletion result:', cloudinaryResult);

      await Image.findByIdAndDelete(id);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Image deleted successfully' 
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete image from cloud storage' 
      });
    }
  } catch (error) {
    console.error('Error in delete operation:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during deletion' 
    });
  }
};