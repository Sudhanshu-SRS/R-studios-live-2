import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePencil, HiOutlineTrash, HiSearch, HiFilter, HiAdjustments, HiCurrencyRupee } from 'react-icons/hi';
import { FiSave } from 'react-icons/fi';

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [stockQuantities, setStockQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    inStock: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [bulkPrice, setBulkPrice] = useState('');

  const navigate = useNavigate();
  const [hoveredImage, setHoveredImage] = useState(null);
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        const processedProducts = response.data.products.map(product => ({
          ...product,
          sizes: product.sizes
            .filter(size => ['S', 'M', 'L', 'XL', 'XXL'].includes(size.size))
            .sort((a, b) => {
              const sizeOrder = { 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5 };
              return sizeOrder[a.size] - sizeOrder[b.size];
            })
        }));
        setList(processedProducts.reverse());
        setFilteredList(processedProducts);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...list];
    
    if (search) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    if (filters.inStock === 'in') {
      filtered = filtered.filter(item => item.sizes.some(s => s.quantity > 0));
    } else if (filters.inStock === 'out') {
      filtered = filtered.filter(item => !item.sizes.some(s => s.quantity > 0));
    }

    setFilteredList(filtered);
  }, [search, filters, list]);

  const updateStock = async (productId, size, newQuantity) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/updateStock`,
        {
          productId,
          size,
          quantity: parseInt(newQuantity)
        },
        {
          headers: { token }
        }
      );

      if (response.data.success) {
        toast.success("Stock updated successfully");
        fetchList();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update stock");
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  // Loading animation component
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full shadow-lg"
        />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto p-6"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Inventory Management</h1>
        <p className="text-gray-600">Manage your product stock levels and inventory</p>
      </motion.div>

      {/* Filters Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-lg shadow-lg p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <HiAdjustments className="text-gray-500 w-5 h-5" />
          <h2 className="text-lg font-semibold text-gray-700">Filters</h2>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative group">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
            </div>
          </div>

          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-4 py-2 border rounded-lg hover:border-blue-500 transition-colors duration-300"
          >
            <option value="">All Categories</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Bride And Groom">Bride And Groom</option>
            <option value="Lehenga">Lehenga</option>
            <option value="Kurti">Kurti</option>
            <option value="Saree">Saree</option>
            <option value="Onepiece">Onepiece</option>
          </select>

          <select
            value={filters.inStock}
            onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.value }))}
            className="px-4 py-2 border rounded-lg hover:border-blue-500 transition-colors duration-300"
          >
            <option value="">All Stock Status</option>
            <option value="in">In Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </motion.div>

      {/* Bulk Price Update Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-white p-6 rounded-lg shadow-md mb-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Bulk Price Update</h3>
            <p className="text-sm text-gray-600">Update price for all products at once</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <HiCurrencyRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                min="0"
                placeholder="Enter new price"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-[200px]"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                if (!bulkPrice) {
                  toast.error('Please enter a valid price');
                  return;
                }
                try {
                  const response = await axios.post(
                    `${backendUrl}/api/product/updateAllPrices`,
                    { newPrice: bulkPrice },
                    { headers: { token } }
                  );
                  if (response.data.success) {
                    toast.success('All prices updated successfully');
                    fetchList();
                    setBulkPrice('');
                  }
                } catch (error) {
                  toast.error('Failed to update prices');
                }
              }}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-md"
            >
              <HiCurrencyRupee className="w-5 h-5" />
              Update All Prices
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Products Grid */}
      <AnimatePresence>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4"
        >
          {filteredList.map((item) => (
            <motion.div
              key={item._id}
              variants={itemVariants}
              layoutId={item._id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => handleImageClick(item.image[0])}
            >
              <div className="flex gap-6">
                {/* Updated Image Container */}
                <motion.div 
                  className="relative w-32 h-32 flex-shrink-0 group overflow-hidden rounded-lg shadow-md"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <motion.img
                    src={item.image[0]}
                    alt={item.name}
                    className="w-full h-full object-contain transform transition-all duration-500 ease-in-out group-hover:scale-110"
                    initial={{ filter: "brightness(0.95)" }}
                    whileHover={{ filter: "brightness(1.05)" }}
                    layoutId={`product-image-${item._id}`}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  
                  {/* Stock Status Indicator */}
                  <motion.div
                    className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                      item.sizes.some(s => s.quantity > 0)
                        ? 'bg-green-500/80 text-white'
                        : 'bg-red-500/80 text-white'
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {item.sizes.some(s => s.quantity > 0) ? 'In Stock' : 'Out of Stock'}
                  </motion.div>
                </motion.div>

                {/* Rest of the product content */}
                <div className="flex-1">
  <div className="flex justify-between items-start mb-4">
    <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
      <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
      <p className="text-sm text-gray-600">{item.category}</p>
      
      {/* Real-time Stock Summary */}
      <div className="mt-2 flex gap-2">
        {item.sizes.map((sizeData) => (
          <motion.div
            key={sizeData.size}
            className={`px-2 py-1 rounded-md text-xs ${
              sizeData.quantity > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
          >
            {sizeData.size}: {stockQuantities[`${item._id}-${sizeData.size}`] ?? sizeData.quantity}
          </motion.div>
        ))}
      </div>
    </motion.div>

    {/* Action Buttons */}
    <div className="flex gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/add', { state: { item, isEdit: true }})}
        className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
      >
        <HiOutlinePencil className="w-5 h-5" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => removeProduct(item._id)}
        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        <HiOutlineTrash className="w-5 h-5" />
      </motion.button>
    </div>
  </div>

  {/* Size Grid with Real-time Updates */}
  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
    {item.sizes.map((sizeData) => (
      <motion.div
        key={sizeData.size}
        className="flex flex-col gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        whileHover={{ scale: 1.02 }}
        onClick={(e) => e.stopPropagation()} // Stop propagation to prevent thumbnail
      >
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">
            Size {sizeData.size}
          </label>
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            (stockQuantities[`${item._id}-${sizeData.size}`] ?? sizeData.quantity) > 0
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {stockQuantities[`${item._id}-${sizeData.size}`] ?? sizeData.quantity} left
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            value={stockQuantities[`${item._id}-${sizeData.size}`] ?? sizeData.quantity}
            onChange={(e) => {
              e.stopPropagation(); // Stop propagation on input change
              setStockQuantities({
                ...stockQuantities,
                [`${item._id}-${sizeData.size}`]: e.target.value
              });
            }}
            onClick={(e) => e.stopPropagation()} // Stop propagation on input click
            className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 text-center"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation(); // Stop propagation on button click
              updateStock(
                item._id,
                sizeData.size,
                stockQuantities[`${item._id}-${sizeData.size}`] ?? sizeData.quantity
              );
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center"
          >
            <FiSave className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    ))}
  </div>
</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Image Modal */}
      <AnimatePresence>
  {(selectedImage || hoveredImage) && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => {
        setSelectedImage(null);
        setHoveredImage(null);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.5 }}
        className="relative max-w-lg max-h-[70vh] bg-white rounded-lg p-2"
        onClick={e => e.stopPropagation()}
      >
        <motion.img
          src={selectedImage || hoveredImage}
          alt="Preview"
          className="w-auto h-auto max-w-full max-h-[65vh] object-contain rounded"
          layoutId="preview-image"
        />
        <button
          onClick={() => {
            setSelectedImage(null);
            setHoveredImage(null);
          }}
          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </motion.div>
  );
};

export default List;
