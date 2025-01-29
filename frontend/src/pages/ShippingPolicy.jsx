import React from 'react';
import { Mail, Phone } from 'lucide-react';
import Title from '../components/Title';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
};

const ShippingPolicy = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="container mx-auto px-6 py-12 bg-gradient-to-r from-gray-100 via-white to-gray-100"
    >
      <Title text1="SHIPPING" text2="POLICY" />

      <motion.div className="mt-12 space-y-10 text-gray-700">
        {/* Shipping Information */}
        <motion.div
          variants={fadeIn}
          className="p-8 bg-white shadow-lg rounded-3xl hover:shadow-xl transition-shadow transform hover:-translate-y-1"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Shipping Information</h2>
          <p className="text-lg">
            At Rashi Studio, we strive to provide reliable and efficient shipping services to our customers. Please review our shipping policy carefully before making a purchase.
          </p>
        </motion.div>

        {/* Processing Time */}
        <motion.div
          variants={fadeIn}
          className="p-8 bg-white shadow-lg rounded-3xl hover:shadow-xl transition-shadow transform hover:-translate-y-1"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Processing Time</h2>
          <ul className="list-disc list-inside space-y-2 text-lg">
            <li>Orders are processed within 24-48 hours of placement.</li>
            <li>Processing time may be extended during sale periods or holidays.</li>
            <li>You will receive a confirmation email with tracking details once your order is shipped.</li>
          </ul>
        </motion.div>

        {/* Delivery Timeline */}
        <motion.div
          variants={fadeIn}
          className="p-8 bg-white shadow-lg rounded-3xl hover:shadow-xl transition-shadow transform hover:-translate-y-1"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Delivery Timeline</h2>
          <ul className="list-disc list-inside space-y-2 text-lg">
            <li>Metro Cities: 3-5 business days</li>
            <li>Other Cities: 5-7 business days</li>
            <li>Remote Areas: 7-10 business days</li>
          </ul>
        </motion.div>

        {/* Shipping Partners */}
        <motion.div
          variants={fadeIn}
          className="p-8 bg-white shadow-lg rounded-3xl hover:shadow-xl transition-shadow transform hover:-translate-y-1"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Shipping Partners</h2>
          <p className="text-lg">We work with reputable courier services to ensure safe and timely delivery of your orders:</p>
          <ul className="list-disc list-inside space-y-2 text-lg">
            <li>FedEx</li>
            <li>BlueDart</li>
            <li>DTDC</li>
          </ul>
        </motion.div>

        {/* Shipping Charges */}
        <motion.div
          variants={fadeIn}
          className="p-8 bg-white shadow-lg rounded-3xl hover:shadow-xl transition-shadow transform hover:-translate-y-1"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Shipping Charges</h2>
          <ul className="list-disc list-inside space-y-2 text-lg">
            <li>Standard Delivery: ₹150 for all orders</li>
            <li>Orders are shipped with tracking facility</li>
            <li>Currently, we only ship within India</li>
          </ul>
        </motion.div>

        {/* Order Tracking */}
        <motion.div
          variants={fadeIn}
          className="p-8 bg-white shadow-lg rounded-3xl hover:shadow-xl transition-shadow transform hover:-translate-y-1"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Order Tracking</h2>
          <ul className="list-disc list-inside space-y-2 text-lg">
            <li>Tracking information will be sent via email and SMS.</li>
            <li>You can track your order through our website using your order ID.</li>
            <li>For any shipping-related queries, please contact our customer service.</li>
          </ul>
        </motion.div>

        {/* Delivery Guidelines */}
        <motion.div
          variants={fadeIn}
          className="p-8 bg-white shadow-lg rounded-3xl hover:shadow-xl transition-shadow transform hover:-translate-y-1"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Delivery Guidelines</h2>
          <ul className="list-disc list-inside space-y-2 text-lg">
            <li>Orders are delivered on business days (Monday to Saturday).</li>
            <li>Signature may be required upon delivery.</li>
            <li>Please ensure the delivery address is correct and complete.</li>
            <li>We are not responsible for delays due to incorrect address information.</li>
          </ul>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          variants={fadeIn}
          className="p-8 bg-white shadow-lg rounded-3xl hover:shadow-xl transition-shadow transform hover:-translate-y-1"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Contact Information</h2>
          <p className="text-lg text-gray-700">For any shipping-related queries, please contact us at:</p>
          <div className="mt-6 flex items-center space-x-4 text-lg">
            <Mail className="w-7 h-7 text-gray-600" />
            <p>
              <a href="mailto:rashifashionoffice@gmail.com" className="text-blue-600 hover:underline">rashifashionoffice@gmail.com</a>
            </p>
          </div>
          <div className="mt-4 flex items-center space-x-4 text-lg">
            <Phone className="w-7 h-7 text-gray-600" />
            <p>
              <a href="tel:+919764804422" className="text-blue-600 hover:underline">(+91) 9764804422</a>
            </p>
          </div>
          <p className="mt-2 text-sm text-gray-500">Business Hours: Monday to Saturday, 10:00 AM - 7:00 PM IST</p>
        </motion.div>

        <motion.div variants={fadeIn}>
          <p className="text-sm text-gray-400 mt-6">
            Note: Shipping policy is subject to change. Please check this page periodically for updates.
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ShippingPolicy;
