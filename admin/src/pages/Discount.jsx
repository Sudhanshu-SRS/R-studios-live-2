import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { HiTag, HiTrash, HiPlus, HiSearch, HiFilter, HiArrowUp } from 'react-icons/hi';
import { backendUrl } from '../App';

const Discounts = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [newDiscount, setNewDiscount] = useState({
    productId: '',
    discountType: 'percentage', // or 'fixed'
    discountValue: '',
    startDate: '',
    endDate: ''
  });
  const [productSearch, setProductSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all'); // 'all', 'inStock', 'lowStock', 'bestseller'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'stock', 'lastSold'
  const [selectedProductRef, setSelectedProductRef] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Fetch products and current discounts
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products);
      }

      // Fetch existing discounts
      const discountsResponse = await axios.get(`${backendUrl}/api/discounts`, {
        headers: { token }
      });
      if (discountsResponse.data.success) {
        setDiscountedProducts(discountsResponse.data.discounts);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleDiscountSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${backendUrl}/api/discounts/add`,
        newDiscount,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Discount added successfully');
        fetchData();
        setNewDiscount({
          productId: '',
          discountType: 'percentage',
          discountValue: '',
          startDate: '',
          endDate: ''
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add discount');
    }
  };

  const removeDiscount = async (productId) => {
    try {
      const response = await axios.delete(
        `${backendUrl}/api/discounts/${productId}`,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Discount removed successfully');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to remove discount');
    }
  };

  const handleProductSelect = (product) => {
    setNewDiscount(prev => ({ ...prev, productId: product._id }));
    // Scroll to discount form
    document.getElementById('discount-form')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
  };

  const getFilteredAndSortedProducts = () => {
    let filtered = [...products];

    // Apply search
    if (productSearch) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.category.toLowerCase().includes(productSearch.toLowerCase())
      );
    }

    // Apply filters
    switch (productFilter) {
      case 'inStock':
        filtered = filtered.filter(product => 
          product.sizes.some(size => size.quantity > 0)
        );
        break;
      case 'outOfStock':
        filtered = filtered.filter(product => 
          !product.sizes.some(size => size.quantity > 0)
        );
        break;
      case 'lowStock':
        filtered = filtered.filter(product => 
          product.sizes.some(size => size.quantity > 0 && size.quantity < 5)
        );
        break;
      case 'bestseller':
        filtered = filtered.filter(product => product.bestseller);
        break;
      default:
        break;
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'stock':
          const aStock = a.sizes.reduce((sum, size) => sum + size.quantity, 0);
          const bStock = b.sizes.reduce((sum, size) => sum + size.quantity, 0);
          return bStock - aStock;
        case 'lastSold':
          return new Date(b.salesData?.lastUpdated || 0) - new Date(a.salesData?.lastUpdated || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  };

  // Handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 relative">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <HiTag className="text-blue-500" />
          Manage Discounts
        </h2>

        {/* Enhanced Product Selection */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg hover:border-blue-500 transition-colors"
            >
              <option value="all">All Products</option>
              <option value="inStock">In Stock</option>
              <option value="outOfStock">Out of Stock</option>
              <option value="lowStock">Low Stock</option>
              <option value="bestseller">Bestsellers</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="name">Sort by Name</option>
              <option value="stock">Sort by Stock Level</option>
              <option value="lastSold">Sort by Last Sale</option>
            </select>
          </div>

          {/* Product Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredAndSortedProducts().map(product => (
              <motion.div
                key={product._id}
                className={`relative bg-white p-4 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden ${
                  newDiscount.productId === product._id 
                    ? 'ring-2 ring-blue-500 shadow-blue-100' 
                    : 'hover:border-blue-200'
                }`}
                onClick={() => handleProductSelect(product)}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Selection Indicator */}
                {newDiscount.productId === product._id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center z-10"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}

                <div className="flex flex-col h-full">
                  {/* Product Image Container */}
                  <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
                    <motion.img
                      src={product.image[0]}
                      alt={product.name}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                    {product.bestseller && (
                      <div className="absolute top-2 left-2 bg-yellow-400/90 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
                        Bestseller
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-medium text-gray-800 text-lg line-clamp-2 hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>

                    {/* Stock Grid */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {product.sizes.map((size, index) => (
                        <motion.div
                          key={`${product._id}-${size.size}-${index}`}
                          className={`relative px-2 py-1.5 rounded-md text-xs font-medium text-center transition-all duration-300 ${
                            size.quantity === 0
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : size.quantity < 5
                              ? 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                              : 'bg-green-50 text-green-600 border border-green-200'
                          }`}
                          whileHover={{ scale: 1.05 }}
                        >
                          <span className="font-semibold">{size.size}</span>
                          <span className="block text-[10px] mt-0.5 opacity-75">
                            {size.quantity} left
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Sales Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        {product.salesData?.totalSold || 0} sold
                      </span>
                      {product.salesData?.lastUpdated && (
                        <span className="cursor-help" title={new Date(product.salesData.lastUpdated).toLocaleString()}>
                          Last sale: {new Date(product.salesData.lastUpdated).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Active Discount Badge */}
                    {discountedProducts.find(d => d._id === product._id) && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                        <HiTag className="w-4 h-4" />
                        <span>Active Discount</span>
                      </div>
                    )}
                  </div>

                  {/* Stock Status Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                    product.sizes.some(size => size.quantity > 0)
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {product.sizes.some(size => size.quantity > 0) ? 'In Stock' : 'Out of Stock'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Add New Discount Form */}
        <form 
          id="discount-form" // Add this ID for scrolling
          onSubmit={handleDiscountSubmit} 
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 mt-12 p-6 bg-white rounded-lg shadow-md"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Product</label>
            <select
              value={newDiscount.productId}
              onChange={(e) => setNewDiscount(prev => ({ ...prev, productId: e.target.value }))}
              className="w-full p-2 border rounded-lg"
              required
            >
              <option value="">Choose a product</option>
              {products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Discount Type</label>
            <select
              value={newDiscount.discountType}
              onChange={(e) => setNewDiscount(prev => ({ ...prev, discountType: e.target.value }))}
              className="w-full p-2 border rounded-lg"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Discount Value</label>
            <input
              type="number"
              value={newDiscount.discountValue}
              onChange={(e) => setNewDiscount(prev => ({ ...prev, discountValue: e.target.value }))}
              className="w-full p-2 border rounded-lg"
              placeholder={newDiscount.discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Valid Till</label>
            <input
              type="date"
              value={newDiscount.endDate}
              onChange={(e) => setNewDiscount(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full p-2 border rounded-lg"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <HiPlus /> Add Discount
          </motion.button>
        </form>

        {/* Current Discounts List */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Active Discounts</h3>
          <div className="grid gap-4">
            {discountedProducts.map(item => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 p-4 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image[0]}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      {item.discountType === 'percentage' ? `${item.discountValue}% off` : `₹${item.discountValue} off`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Valid till: {new Date(item.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeDiscount(item._id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                >
                  <HiTrash className="w-5 h-5" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-colors z-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <HiArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Discounts;