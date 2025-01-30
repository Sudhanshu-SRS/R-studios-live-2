import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch, HiFilter, HiX } from 'react-icons/hi';

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
        { orderId, status: event.target.value },
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
        <p className="text-gray-600">Manage and track all orders</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, product, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg hover:border-blue-500"
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

      {/* Orders List */}
      <AnimatePresence>
        {loading ? (
          <motion.div className="flex justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
            />
          </motion.div>
        ) : (
          <motion.div layout className="space-y-6">
            {filteredOrders.map((order) => (
              <motion.div
                key={order._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-medium">{order._id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Order Items */}
                <div className="space-y-4 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <img src={item.image[0]} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Size: {item.size} × {item.quantity}</p>
                        <p className="text-sm text-gray-600">{currency}{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Details */}
                <div className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Shipping Address</p>
                    <p>{order.address.firstName} {order.address.lastName}</p>
                    <p>{order.address.street}</p>
                    <p>{order.address.city}, {order.address.state}</p>
                    <p>{order.address.zipcode}, {order.address.country}</p>
                    <p>{order.address.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Order Info</p>
                    <p>Amount: {currency}{order.amount}</p>
                    <p>Payment: {order.payment ? 'Paid' : 'Pending'}</p>
                    <p>Method: {order.paymentMethod}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <select
                    onChange={(e) => statusHandler(e, order._id)}
                    value={order.status}
                    className="px-3 py-2 border rounded-lg hover:border-blue-500"
                    disabled={order.status === 'Cancelled'}
                  >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Packing">Packing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>

                  {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                    <button
                      onClick={() => cancelOrder(order._id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>

                {/* Shipping Details */}
                {order.shipmentId && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">Shipping Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm">AWB: {order.awbCode}</p>
                        <p className="text-sm">Courier: {order.courierName}</p>
                      </div>
                      <div>
                        <p className="text-sm">Status: {order.trackingStatus}</p>
                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
                          >
                            Track Order →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;