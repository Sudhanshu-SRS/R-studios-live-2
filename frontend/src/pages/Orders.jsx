import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

// Update the ORDER_STAGES constant
const ORDER_STAGES = [
  { key: 'Order Placed', icon: '📦' },
  { key: 'Packing', icon: '🎁' },
  { key: 'Shipped', icon: '🚚' },
  { key: 'Out for Delivery', icon: '🏃' },
  { key: 'Delivered', icon: '✅' }
  // Don't add Cancelled here as it's a special state
];

const Orders = () => {
  const { backendUrl, token, currency, navigate } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  // Add new state for tracking details
  const [trackingDetails, setTrackingDetails] = useState({});

  const loadOrderData = async () => {
    try {
        setLoading(true);
        const storedToken = token || localStorage.getItem('token');
        
        if (!storedToken) {
            toast.error('Please login to view orders');
            navigate('/login');
            return;
        }

        const response = await axios.post(
            `${backendUrl}/api/order/userorders`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }
        );

        if (response.data.success) {
            let allOrdersItem = [];
            response.data.orders.forEach((order) => {
                order.items.forEach((item) => {
                    item.status = order.status;
                    item.payment = order.payment;
                    item.paymentMethod = order.paymentMethod;
                    item.date = order.date;
                    item.cancellationReason = order.cancellationReason; // Add this line
                    allOrdersItem.push(item);
                });
            });
            setOrderData(allOrdersItem.reverse());
        }
    } catch (error) {
        toast.error('Failed to fetch orders');
    } finally {
        setLoading(false);
    }
};

  // Add function to fetch tracking details
  const fetchTracking = async (orderId, awbCode) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/order/tracking/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setTrackingDetails(prev => ({
          ...prev,
          [orderId]: response.data.tracking
        }));
      }
    } catch (error) {
      console.error('Tracking fetch error:', error);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  // Add useEffect to fetch tracking for shipped orders
  useEffect(() => {
    orderData.forEach(item => {
      if (item.status === 'Shipped' && item.awbCode) {
        fetchTracking(item._id, item.awbCode);
      }
    });
  }, [orderData]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orderData 
    : orderData.filter(order => order.status.toLowerCase() === selectedStatus);

  // Update the getStageStatus function
  const getStageStatus = (currentStatus, stageKey) => {
    if (currentStatus === 'Cancelled') {
      return 'cancelled';
    }

    const stageOrder = ORDER_STAGES.map(stage => stage.key);
    const currentStageIndex = stageOrder.indexOf(currentStatus);
    const stageIndex = stageOrder.indexOf(stageKey);

    if (stageIndex < currentStageIndex) return 'completed';
    if (stageIndex === currentStageIndex) return 'current';
    return 'pending';
  };

  // Update the status display to use tracking data
  const getShipmentStatus = (item) => {
    if (item.status === 'Shipped' && trackingDetails[item._id]?.current_status) {
      return trackingDetails[item._id].current_status;
    }
    return item.status;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Title text1="MY" text2="ORDERS" />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
            className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <>
          {/* Filter buttons */}
          <div className="mb-6 flex flex-wrap gap-4">
            {['all', 'pending', 'processing', 'shipped', 'delivered'].map(status => (
              <motion.button
                key={status}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg capitalize transition-all duration-300
                  ${selectedStatus === status 
                    ? 'bg-teal-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {status}
              </motion.button>
            ))}
          </div>

          {/* Orders list */}
          <AnimatePresence>
            {filteredOrders.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {filteredOrders.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Image container with fixed aspect ratio */}
                      <div className="w-full md:w-1/4">
                        <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                          <img 
                            src={item.image[0]} 
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-contain bg-gray-50"
                          />
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                        </div>

                        {/* Add this to your order item rendering */}
                        {item.status === 'Cancelled' ? (
                          <div className="mt-6">
                            <div className="relative">
                              <div className="absolute top-5 left-0 w-full h-1 bg-gray-200">
                                <motion.div 
                                  className="h-full bg-red-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: '100%' }}
                                  transition={{ duration: 0.5 }}
                                />
                              </div>
                              <div className="relative flex justify-center">
                                <div className="flex flex-col items-center">
                                  <motion.div 
                                    className="w-10 h-10 rounded-full bg-red-50 text-white flex items-center justify-center z-10"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                  >
                                    <span className='text-2xl'>❌</span>
                                  </motion.div>
                                  <p className="mt-2 text-xs font-medium text-red-600">
                                    Order Cancelled
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.date).toLocaleDateString()}
                    </p>
                    {item.cancellationReason ? (
                        <p className="text-xs text-red-500 mt-1 max-w-[200px] text-center">
                            Reason: {item.cancellationReason}
                        </p>
                    ) : (
                        <p className="text-xs text-gray-500 mt-1">
                            No reason provided
                        </p>
                    )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-6">
                            <div className="relative">
                              <div className="absolute top-5 left-0 w-full h-1 bg-gray-200">
                                <motion.div 
                                  className="h-full bg-green-500"
                                  initial={{ width: 0 }}
                                  animate={{ 
                                    width: `${(ORDER_STAGES.findIndex(stage => stage.key === getShipmentStatus(item)) / (ORDER_STAGES.length - 1)) * 100}%` 
                                  }}
                                  transition={{ duration: 0.5 }}
                                />
                              </div>

                              <div className="relative flex justify-between">
                                {ORDER_STAGES.map((stage, idx) => {
                                  const status = getStageStatus(getShipmentStatus(item), stage.key);
                                  return (
                                    <div key={stage.key} className="flex flex-col items-center">
                                      <motion.div 
                                        className={`w-10 h-10 rounded-full flex items-center justify-center z-10 
                                          ${status === 'completed' ? 'bg-green-500 text-white' : 
                                            status === 'current' ? 'bg-blue-500 text-white' :
                                            'bg-gray-200 text-gray-500'}`}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                      >
                                        <span>{stage.icon}</span>
                                      </motion.div>
                                      <p className={`mt-2 text-xs font-medium
                                        ${status === 'completed' ? 'text-green-600' :
                                          status === 'current' ? 'text-blue-600' :
                                          'text-gray-500'}`}
                                      >
                                        {stage.key}
                                      </p>
                                      {getShipmentStatus(item) === stage.key && (
                                        <>
                                          <p className="text-xs text-gray-500 mt-1">
                                            {new Date(item.date).toLocaleDateString()}
                                          </p>
                                          {trackingDetails[item._id]?.tracking_data?.etd && (
                                            <p className="text-xs text-blue-500 mt-1">
                                              Expected Delivery: {new Date(trackingDetails[item._id].tracking_data.etd).toLocaleDateString()}
                                            </p>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Additional order details */}
                        <div className="text-sm text-gray-600 space-y-2 mt-4">
                          <p>Order ID: #{item._id}</p>
                          <p>Payment: {item.payment ? 'Paid' : 'Pending'} ({item.paymentMethod})</p>
                          <p>Size: {item.size} × {item.quantity}</p>
                          <p>Amount: {currency}{item.price * item.quantity}</p>
                        </div>

                        {/* Add tracking updates */}
                        {item.status === 'Shipped' && trackingDetails[item._id]?.tracking_data?.shipment_track && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-700 mb-2">Tracking Updates</h4>
                            <div className="space-y-3">
                              {trackingDetails[item._id].tracking_data.shipment_track.map((track, idx) => (
                                <div key={idx} className="flex gap-3 text-sm">
                                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                                  <div>
                                    <p className="font-medium">{track.status}</p>
                                    <p className="text-gray-600">{track.activity}</p>
                                    <p className="text-gray-500">{new Date(track.date).toLocaleString()}</p>
                                    {track.location && (
                                      <p className="text-gray-500">{track.location}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-500">No orders found</p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default Orders;
