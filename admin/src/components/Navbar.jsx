import React from 'react';
import { assets } from '../assets/assets';
import { motion } from 'framer-motion';
import { HiLogout } from 'react-icons/hi';

const Navbar = ({setToken}) => {
  return (
    <>
      {/* Spacer div to prevent content overlap */}
      <div className="h-[110px]"></div> {/* Adjust height to match navbar height */}
      
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className='fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg'
      >
        <div className='flex items-center justify-between h-[110px] px-6 max-w-7xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <motion.img 
              className='w-24 cursor-pointer'
              src={assets.logo} 
              alt="R-Studio Admin" 
              whileHover={{ scale: 1.05, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <div className="hidden sm:block">
              <h1 className="text-white text-xl font-semibold">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm">Manage your store</p>
            </div>
          </motion.div>

          <motion.button 
            onClick={() => setToken('')}
            className='flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 hover:shadow-lg'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <HiLogout className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

export default Navbar;