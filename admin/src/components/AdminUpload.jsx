import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { HiUpload, HiTrash, HiPhotograph } from 'react-icons/hi';
import { toast } from 'react-toastify';

const AdminUpload = () => {
  const [image, setImage] = useState(null);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

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
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      toast.error("Please select an image to upload.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', 'Crousel'); // Replace 'Crousel' with your actual Cloudinary upload preset

    try {
      const res = await axios.post('https://api.cloudinary.com/v1_1/dp7gtidih/image/upload', formData);
      const imageUrl = res.data.secure_url;

      // Save the image URL to your database
      await axios.post(`http://localhost:4000/api/images`, { url: imageUrl });

      setLoading(false);
      toast.success('Image uploaded successfully');
      fetchImages(); // Refresh the images list
      setImage(null); // Clear the selected image
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image');
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

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setImage(files[0]);
    }
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
      <div className="flex items-center gap-3 mb-6">
        <HiUpload className="w-8 h-8 text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-800">Image Management</h1>
      </div>

      {/* Add drag and drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8
          transition-colors duration-300 ease-in-out
          flex flex-col items-center justify-center gap-4
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400'
          }
        `}
      >
        <HiUpload className={`w-12 h-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
        <p className="text-gray-600 text-center">
          Drag and drop your image here, or
          <button
            onClick={() => fileInputRef.current.click()}
            className="text-blue-500 hover:text-blue-600 font-medium mx-1"
          >
            browse
          </button>
          to choose a file
        </p>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      {/* Image Preview */}
      {image && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700">Selected Image:</h3>
          <img
            src={URL.createObjectURL(image)}
            alt="Selected"
            className="mt-2 w-48 h-48 object-cover rounded-lg shadow-md"
          />
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!image || loading}
        className={`
          px-4 py-2 rounded-lg text-white
          transition-all duration-300
          ${!image || loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600'
          }
        `}
      >
        {loading ? 'Uploading...' : 'Upload Image'}
      </button>

      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }} className="space-y-4 mt-6">
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
                  className={`relative group aspect-square rounded-lg overflow-hidden shadow-md ${selectedImageId === image._id ? 'ring-2 ring-blue-500' : ''}`}
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