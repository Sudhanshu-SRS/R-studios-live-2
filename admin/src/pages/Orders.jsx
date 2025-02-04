import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineSearch,
  HiFilter,
  HiOutlineRefresh,
  HiOutlineTrash,
} from "react-icons/hi";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [trackingDetails, setTrackingDetails] = useState({});
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchAllOrders = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.post(
        `${backendUrl}/api/order/list`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    if (newStatus === "Shipped") {
      // Automatically update status from Shiprocket
      try {
        const response = await axios.post(
          `${backendUrl}/api/order/shiprocket-status`,
          { orderId },
          { headers: { token } }
        );
        if (response.data.success) {
          toast.success("Status updated from Shiprocket successfully");
          await fetchAllOrders();
        }
      } catch (error) {
        toast.error("Failed to update status from Shiprocket");
      }
    } else {
      // Allow admin to update only "Order Placed" and "Packing"
      try {
        const response = await axios.post(
          `${backendUrl}/api/order/status`,
          {
            orderId,
            status: newStatus,
            sendEmail: true,
          },
          { headers: { token } }
        );
        if (response.data.success) {
          toast.success("Status updated successfully");
          await fetchAllOrders();
        }
      } catch (error) {
        toast.error("Failed to update status");
      }
    }
  };

  const cancelOrder = async (orderId) => {
    const reason = prompt("Please enter the cancellation reason:");
    if (!reason) return;
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/cancel`,
        { orderId, reason },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Order cancelled successfully");
        await fetchAllOrders();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to cancel order");
    }
  };

  const cleanupCancelledOrders = async () => {
    try {
      const response = await axios.delete(
        `${backendUrl}/api/order/cleanup-cancelled`,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchAllOrders();
      }
    } catch (error) {
      toast.error("Failed to cleanup cancelled orders");
    }
  };

  const fetchTracking = async (orderId, showToast = false) => {
    try {
      setTrackingDetails((prev) => ({
        ...prev,
        [orderId]: { ...prev[orderId], isLoading: true },
      }));

      const response = await axios.get(
        `${backendUrl}/api/order/tracking/${orderId}`,
        { headers: { token, "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        setTrackingDetails((prev) => ({
          ...prev,
          [orderId]: {
            ...response.data.tracking,
            isLoading: false,
            lastUpdated: new Date().toISOString(),
          },
        }));
        if (showToast) toast.success("Tracking info updated");
      }
    } catch (error) {
      console.error("Tracking fetch error:", error);
      setTrackingDetails((prev) => ({
        ...prev,
        [orderId]: { ...prev[orderId], isLoading: false, error: true },
      }));
      if (showToast) toast.error("Failed to fetch tracking details");
    }
  };

  const sendTrackingUpdate = async (orderId) => {
    try {
        const response = await axios.post(
            `${backendUrl}/api/order/send-tracking-whatsapp/${orderId}`,
            {},
            { headers: { token } }
        );
        
        if (response.data.success) {
            toast.success('Tracking update sent to customer');
        }
    } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to send tracking update');
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  useEffect(() => {
    const fetchAllTracking = async () => {
      try {
        const trackableOrders = orders.filter(
          (order) =>
            order.awbCode &&
            order.status !== "Cancelled" &&
            order.status !== "Delivered"
        );
        if (trackableOrders.length === 0) return;
        toast.info("Updating tracking information...", {
          autoClose: false,
          toastId: "tracking-update",
        });
        for (const order of trackableOrders) {
          await fetchTracking(order._id, false);
        }
        toast.dismiss("tracking-update");
        toast.success(`Updated tracking for ${trackableOrders.length} active orders`);
      } catch (error) {
        toast.dismiss("tracking-update");
        toast.error("Failed to update tracking information");
      }
    };

    fetchAllTracking();
    const interval = setInterval(fetchAllTracking, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [orders]);

  const filteredOrders = orders.filter((order) => {
    if (selectedStatus !== "all" && order.status !== selectedStatus) return false;
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      order._id.toLowerCase().includes(searchLower) ||
      `${order.address.firstName} ${order.address.lastName}`.toLowerCase().includes(searchLower) ||
      order.address.phone?.toLowerCase().includes(searchLower)
    );
  });

  const isTrackingAvailable = (order) => {
    return order.awbCode && order.status !== "Cancelled" && 
           order.status !== "Order Placed" && order.status !== "Packing";
  };

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Order Management
            </h1>
            <p className="text-gray-600">
              Track and manage all customer orders
            </p>
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={cleanupCancelledOrders}
              className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2 hover:bg-red-600 transition-colors"
            >
              <HiOutlineTrash className="w-5 h-5" />
              Cleanup Cancelled Orders
            </motion.button>
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
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
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
      </div>
      {loading ? (
        <motion.div
          className="flex justify-center items-center h-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div className="space-y-6">
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
                  getStatusColor={(status) =>
                    status === "Cancelled"
                      ? "bg-red-100 text-red-700"
                      : status === "Delivered"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }
                  statusHandler={statusHandler}
                  onCancelOrder={cancelOrder}
                  fetchTracking={fetchTracking}
                  trackingDetails={trackingDetails}
                  sendTrackingUpdate={sendTrackingUpdate}
                  isTrackingAvailable={(order) => {  // Add this prop
                    return order.awbCode && 
                           order.status !== "Cancelled" && 
                           order.status !== "Order Placed" && 
                           order.status !== "Packing";
                  }}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      )}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: 50 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 rounded-full bg-blue-500 text-white shadow-xl hover:bg-blue-600 transition z-50"
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const OrderCard = ({
  order,
  getStatusColor,
  statusHandler,
  onUpdateStatus,
  onCancelOrder,
  fetchTracking,
  trackingDetails,
  sendTrackingUpdate,
  isTrackingAvailable,
}) => {
  return (
    <motion.div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Order #{order._id}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(order.date).toLocaleString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Payment Details</h4>
            <div className="space-y-1 text-sm">
              <p>Method: {order.paymentMethod}</p>
              <p>Status: {order.payment ? "Paid" : "Pending"}</p>
              <p>Amount: {currency} {order.amount}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Customer Details</h4>
            <div className="space-y-1 text-sm">
              <p>
                Name: {order.address.firstName} {order.address.lastName}
              </p>
              <p>Email: {order.address.email}</p>
              <p>Phone: {order.address.phone}</p>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Delivery Address</h4>
            <div className="space-y-1 text-sm">
              <p>{order.address.street}</p>
              <p>
                {order.address.city}, {order.address.state}
              </p>
              <p>
                {order.address.zipcode}, {order.address.country}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 pt-6 mb-6">
        <p className="text-sm text-gray-500 mb-4">Order Items</p>
        <div className="space-y-4">
          {order.items?.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <img
                src={item.image?.[0] || "/placeholder-image.jpg"}
                alt={item.name || "Product"}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  Size: {item.size} × {item.quantity}
                </p>
                <p className="text-sm text-gray-500">
                  Price: {currency}{item.price} × {item.quantity} = {currency}
                  {item.price * item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-2">
        <select
          defaultValue={order.status}
          onChange={(event) => statusHandler(event, order._id)}
          className="px-4 py-2 border rounded-lg"
          disabled={order.status === "Cancelled" || order.status === "Delivered" || order.status === "Shipped"}
        >
          <option value="Order Placed">Order Placed</option>
          <option value="Packing">Packing</option>
          <option value="Shipped">Shipped</option>
          <option value="Out for delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        {order.status !== "Cancelled" && order.status !== "Delivered" && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCancelOrder(order._id)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg transition shadow-md hover:shadow-lg hover:bg-red-600"
          >
            Cancel Order
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fetchTracking(order._id, true)}
          disabled={!isTrackingAvailable(order)}
          title={!isTrackingAvailable(order) ? 
            "Tracking will be available once order is shipped" : 
            "Refresh tracking information"
          }
          className={`px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 
            transition shadow-md hover:shadow-lg 
            ${!isTrackingAvailable(order) ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <HiOutlineRefresh className={trackingDetails[order._id]?.isLoading ? "animate-spin" : ""} />
          {!order.awbCode ? "Tracking Not Available" : "Refresh Tracking"}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => sendTrackingUpdate(order._id)}
          disabled={!order.awbCode || order.status === "Cancelled"}
          className={`px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2 transition shadow-md hover:shadow-lg ${
            !order.awbCode || order.status === "Cancelled"
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-green-600"
        }`}
        >
          <HiOutlineRefresh className="w-4 h-4" />
          Send Tracking Update
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Orders;
