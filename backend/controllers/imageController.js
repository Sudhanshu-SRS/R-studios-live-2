// filepath: /F:/Wifi passes/R-studios/backend/controllers/imageController.js
import Image from '../models/imageModel.js';
import cloudinary from '../config/cloudinary.js';

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
export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findById(id);
    if (image) {
      const publicId = image.url.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
      await Image.findByIdAndDelete(id);
      res.status(200).json({ success: true, message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Image not found' });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};