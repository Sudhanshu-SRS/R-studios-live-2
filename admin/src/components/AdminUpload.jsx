import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminUpload = () => {
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);

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

  return (
    <div>
      <h2 className='text-lg font-semibold my-4'>Upload Image</h2>
      <input type="file" onChange={handleImageChange} />
      <button className='bg-red-500 hover:bg-gray-800 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm flex my-5' onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>

      <h2 className='text-lg font-semibold my-4'>Manage Images</h2>
      <ul className='flex flex-wrap'>
        {Array.isArray(images) && images.length > 0 ? (
          images.map((image) => (
            <li
              key={image._id}
              className={`m-2 p-1 border ${selectedImageId === image._id ? 'border-blue-500' : 'border-transparent'}`}
              onClick={() => handleSelectImage(image._id)}
              style={{ cursor: 'pointer', width: '100px', height: '100px' }}
            >
              <img
                src={image.url}
                alt="Uploaded"
                className={`w-full h-full object-cover ${selectedImageId === image._id ? 'transform scale-110' : ''}`}
              />
            </li>
          ))
        ) : (
          <li>No images available</li>
        )}
      </ul>
      {selectedImageId && (
        <button
          className='bg-red-500 hover:bg-gray-800 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm flex my-5'
          onClick={() => handleDelete(selectedImageId)}
        >
          Delete Selected Image
        </button>
      )}
    </div>
  );
};

export default AdminUpload;