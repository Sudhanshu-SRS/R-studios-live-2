import React from 'react';
import { motion } from 'framer-motion';
import Title from '../components/Title';
import { HiOutlineSupport, HiOutlineScale, HiPhone, HiMail, HiClock, HiLocationMarker, HiOutlineCash, HiOutlineShoppingCart, HiOutlineShieldCheck } from 'react-icons/hi';

const TermsAndConditions = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-4xl mx-auto px-4 py-8 space-y-12"
    >
      <Title text1="TERMS AND" text2="CONDITIONS" />

      <motion.div variants={sectionVariants} className="space-y-8">
        {/* Customer Support Section */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300"
          whileHover={{ y: -5 }}
        >
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-gray-800">
            <HiOutlineSupport className="w-6 h-6 text-teal-500" />
            Customer Support
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600 hover:text-teal-500 transition-colors">
                <HiMail className="w-5 h-5" />
                <a href="mailto:rashifashionoffice@gmail.com" className="hover:underline">
                  rashifashionoffice@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-600 hover:text-teal-500 transition-colors">
                <HiPhone className="w-5 h-5" />
                <a href="tel:+919764804422" className="hover:underline">
                  (+91) 9764804422
                </a>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <HiClock className="w-5 h-5 text-teal-500" />
                <p>Monday to Saturday<br />10:00 AM - 7:00 PM IST</p>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <HiLocationMarker className="w-5 h-5 text-teal-500" />
                <p>Nagpur, Maharashtra</p>
              </div>
            </div>
          </div>
        </motion.div>

      

        {/* Payment & Orders Section */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300"
          whileHover={{ y: -5 }}
        >
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-gray-800">
            <HiOutlineCash className="w-6 h-6 text-teal-500" />
            Payment & Orders
          </h2>
          <div className="space-y-4 text-gray-600">
            <p>1.1 Payment Methods:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Cash on Delivery (COD)</li>
              <li>Online payments via Razorpay (Credit/Debit Cards, UPI, Net Banking)</li>
              <li>Stripe for international payments</li>
            </ul>
            <p>1.2 Order Confirmation:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Orders are confirmed only after successful payment verification</li>
              <li>Order confirmation will be sent via email</li>
              <li>We reserve the right to cancel orders in case of pricing errors</li>
            </ul>
          </div>
        </motion.div>

        {/* Shipping & Delivery Section */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300"
          whileHover={{ y: -5 }}
        >
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-gray-800">
            <HiOutlineShoppingCart className="w-6 h-6 text-teal-500" />
            Shipping & Delivery
          </h2>
          <div className="space-y-4 text-gray-600">
            <p>2.1 Shipping Charges:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Fixed delivery charge of ₹150 for all orders</li>
              <li>Free shipping offers may apply during promotions</li>
            </ul>
            <p>2.2 Delivery Timeline:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Metro Cities: 3-5 business days</li>
              <li>Other Cities: 5-7 business days</li>
              <li>Remote Areas: 7-10 business days</li>
            </ul>
          </div>
        </motion.div>

        {/* Returns & Refunds Section */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300"
          whileHover={{ y: -5 }}
        >
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-gray-800">
            <HiOutlineShieldCheck className="w-6 h-6 text-teal-500" />
            Returns & Refunds
          </h2>
          <div className="space-y-4 text-gray-600">
            <p>3.1 No Return Policy:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>All sales are final and non-returnable</li>
              <li>No refunds will be processed once order is placed</li>
              <li>Customers are advised to carefully check size and specifications before ordering</li>
            </ul>
            <p>3.2 Exceptions:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Wrong product delivery will be replaced</li>
              <li>Damaged products must be reported within 24 hours with photos</li>
            </ul>
          </div>
        </motion.div>

        {/* Privacy & Security Section */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300"
          whileHover={{ y: -5 }}
        >
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-gray-800">
            <HiOutlineShieldCheck className="w-6 h-6 text-teal-500" />
            Privacy & Security
          </h2>
          <div className="space-y-4 text-gray-600">
            <p>4.1 Data Protection:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Personal information is protected and encrypted</li>
              <li>Payment details are not stored on our servers</li>
              <li>Customer data is never shared with third parties</li>
            </ul>
          </div>
        </motion.div>

        {/* User Accounts Section */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300"
          whileHover={{ y: -5 }}
        >
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-gray-800">
            <HiOutlineShieldCheck className="w-6 h-6 text-teal-500" />
            User Accounts
          </h2>
          <div className="space-y-4 text-gray-600">
            <p>5.1 Account Security:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Users are responsible for maintaining account security</li>
              <li>Email verification is required for new accounts</li>
              <li>Suspicious activities should be reported immediately</li>
            </ul>
          </div>
        </motion.div>
          {/* Governing Law Section */}
          <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300"
          whileHover={{ y: -5 }}
        >
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-gray-800">
            <HiOutlineScale className="w-6 h-6 text-teal-500" />
            Governing Law
          </h2>
          <p className="text-gray-600 leading-relaxed">
            These terms shall be governed by and construed in accordance with the laws of India, 
            and any disputes will be subject to the exclusive jurisdiction of the courts in Nagpur, Maharashtra.
          </p>
        </motion.div>
        {/* Footer Section */}
        <motion.div 
          variants={sectionVariants}
          className="mt-12 pt-6 border-t border-gray-200 text-center space-y-2"
        >
          <p className="text-sm text-gray-500">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
          <motion.p 
            className="text-lg font-semibold text-gray-800"
            whileHover={{ scale: 1.05 }}
          >
            R-Studio Fashion Private Limited
          </motion.p>
          <p className="text-sm text-gray-500">Nagpur, Maharashtra, India</p>
        </motion.div>
        
      </motion.div>
    </motion.div>
    

    
  );
};

export default TermsAndConditions;
