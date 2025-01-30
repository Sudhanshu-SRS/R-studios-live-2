import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch, HiFilter, HiOutlineRefresh } from 'react-icons/hi';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllOrders = async () => {
    if (!token) return;
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/list`, 
        {}, 
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      }
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
        const response = await axios.post(
            `${backendUrl}/api/order/status`,
            { 
                orderId, 
                status: event.target.value,
                sendEmail: true // Add this flag
            },
            { headers: { token } }
        );
        if (response.data.success) {
            toast.success('Status updated successfully');
            await fetchAllOrders();
        }
    } catch (error) {
        toast.error('Failed to update status');
    }
  };

  const cancelOrder = async (orderId) => {
    // Show prompt for cancellation reason
    const reason = prompt('Please enter the cancellation reason:');
    if (!reason) return; // Cancel if no reason provided
    
    try {
        const response = await axios.post(
            `${backendUrl}/api/order/cancel`,
            { 
                orderId,
                reason // Add reason to request body
            },
            { headers: { token } }
        );
        
        if (response.data.success) {
            toast.success('Order cancelled successfully');
            await fetchAllOrders();
        }
    } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to cancel order');
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'all' ? true : order.status === selectedStatus;
    const matchesSearch = searchTerm === '' ? true : 
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address?.phone?.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Order Placed': return 'bg-blue-100 text-blue-800';
      case 'Packing': return 'bg-yellow-100 text-yellow-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Out for delivery': return 'bg-indigo-100 text-indigo-800';
      case 'Delivered': return 'bg-green-100 text-3green-800';
      case 'Cancelled': return 'bg-red-100 text-red3-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Animation variants
  const pageVariants = {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 py-8"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Enhanced Header Section */}
      <motion.div 
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
        variants={containerVariants}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Management</h1>
            <p className="text-gray-600">Track and manage all customer orders</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchAllOrders}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <HiOutlineRefresh className="w-5 h-5" />
            Refresh Orders
          </motion.button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Enhanced Search Bar */}
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, product name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Enhanced Status Filter */}
          <div className="flex items-center gap-2">
            <HiFilter className="text-gray-500" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg hover:border-blue-500 transition-colors"
            >
              <option value="all">All Orders</option>
              <option value="Order Placed">Order Placed</option>
              <option value="Packing">Packing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Orders List */}
      {loading ? (
        <motion.div 
          className="flex justify-center items-center h-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div 
            variants={containerVariants}
            className="space-y-6"
          >
            {filteredOrders.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 bg-white rounded-lg shadow"
              >
                <p className="text-gray-500">No orders found</p>
              </motion.div>
            ) : (
              filteredOrders.map((order) => (
                <OrderCard 
                  key={order._id}
                  order={order}
                  getStatusColor={getStatusColor}
                  onUpdateStatus={statusHandler}
                  onCancelOrder={cancelOrder}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

// Separate OrderCard component for better organization
const OrderCard = ({ order, getStatusColor, onUpdateStatus, onCancelOrder }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
  >
    <div className="flex flex-col md:flex-row justify-between gap-4">
      <div>
        <div className="flex items-center gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-medium">{order._id}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>

        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <img 
                src={item.image[0]} 
                alt={item.name} 
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">Size: {item.size} × {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-2">Customer Details</p>
          <p className="font-medium">{order.address.firstName} {order.address.lastName}</p>
          <p className="text-sm text-gray-500">{order.address.phone}</p>
        </div>

        <div className="flex flex-col gap-2">
          <select
            value={order.status}
            onChange={(e) => onUpdateStatus(e, order._id)}
            className="px-4 py-2 border rounded-lg"
            disabled={order.status === 'Cancelled' || order.status === 'Delivered'}
          >
            <option value="Order Placed">Order Placed</option>
            <option value="Packing">Packing</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
          </select>

          {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCancelOrder(order._id)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Cancel Order
            </motion.button>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

export default Orders;