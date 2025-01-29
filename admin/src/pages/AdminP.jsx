import React from 'react';
import AdminUpload from '../components/AdminUpload';
import { motion } from 'framer-motion';
import { HiUpload } from 'react-icons/hi';

const AdminPage = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto p-6"
    >
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-lg shadow-lg p-6 mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <HiUpload className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-800">
            Front  Image Management
          </h1>
        </div>

        <motion.p 
          variants={itemVariants}
          className="text-gray-600 mb-8"
        >
          Upload and manage images for your website's main carousel. Choose high-quality images 
          for the best presentation of your products.
        </motion.p>

        <motion.div 
          variants={itemVariants}
          className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300"
        >
          <AdminUpload />
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100"
        >
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            Image Guidelines
          </h2>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-2">
            <li>Recommended image dimensions: 1920x1080 pixels</li>
            <li>Maximum file size: 5MB</li>
            <li>Supported formats: JPG, PNG, WebP</li>
            <li>Use high-resolution images for better quality</li>
          </ul>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AdminPage;