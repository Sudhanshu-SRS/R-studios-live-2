import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { HiUpload, HiTrash, HiPhotograph } from 'react-icons/hi';
import { toast } from 'react-toastify';

const AdminUpload = () => {
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/api/images`);
      if (Array.isArray(res.data)) {
        setImages(res.data);
      } else {
        console.error('API response is not an array:', res.data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', 'Crousel'); // Replace 'your_upload_preset' with your actual Cloudinary upload preset

    try {
      const res = await axios.post('https://api.cloudinary.com/v1_1/dp7gtidih/image/upload', formData);
      const imageUrl = res.data.secure_url;

      // Save the image URL to your database
      await axios.post(`http://localhost:4000/api/images`, { url: imageUrl });

      setLoading(false);
      alert('Image uploaded successfully');
      fetchImages(); // Refresh the images list
    } catch (error) {
      console.error('Error uploading image:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (imageId) => {
    console.log('Deleting image with id:', imageId); // Log the imageId
    try {
      const res = await axios.delete(`http://localhost:4000/api/images/${imageId}`);
      alert('Image deleted successfully');
      fetchImages(); // Refresh the images list
    } catch (error) {
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      console.error('Error config:', error.config);
    }
  };

  const handleSelectImage = (imageId) => {
    setSelectedImageId(imageId);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Upload Area */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-xl p-8
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          transition-colors duration-300
        `}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          // Handle file drop
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={(e) => {/* Handle file selection */}}
        />
        
        <div className="flex flex-col items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-blue-100 rounded-full"
          >
            <HiUpload className="w-8 h-8 text-blue-500" />
          </motion.div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700">
              Drag and drop your images here
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              or click to browse from your computer
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Choose Files
          </motion.button>
        </div>
      </motion.div>

      {/* Image Grid */}
      <motion.div variants={containerVariants} className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <HiPhotograph className="text-blue-500" />
          Uploaded Images
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <AnimatePresence>
            {images.length > 0 ? (
              images.map((image) => (
                <motion.div
                  key={image._id}
                  variants={itemVariants}
                  layoutId={`image-${image._id}`}
                  className={`
                    relative group aspect-square rounded-lg overflow-hidden shadow-md
                    ${selectedImageId === image._id ? 'ring-2 ring-blue-500' : ''}
                  `}
                  onClick={() => setSelectedImageId(image._id)}
                >
                  <motion.img
                    src={image.url}
                    alt="Carousel"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(image._id);
                    }}
                  >
                    <HiTrash className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No images uploaded yet
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminUpload;