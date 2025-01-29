import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const Orders = () => {
  const { backendUrl, token, currency, navigate } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

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
            allOrdersItem.push(item);
          });
        });
        setOrderData(allOrdersItem.reverse()); // Show newest first
      }
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

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
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 space-y-2">
                          <p>Size: {item.size}</p>
                          <p>Quantity: {item.quantity}</p>
                          <p>Price: {currency}{item.price}</p>
                          <p>Total: {currency}{item.price * item.quantity}</p>
                          <p>Payment: {item.payment ? 'Paid' : 'Pending'}</p>
                          <p>Method: {item.paymentMethod}</p>
                          <p>Order Date: {new Date(item.date).toLocaleDateString()}</p>
                        </div>
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
