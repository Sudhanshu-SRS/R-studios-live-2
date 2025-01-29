import React, { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HiOutlineMailOpen, HiOutlineExclamationCircle } from "react-icons/hi";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const PopupVerify = ({ onClose }) => {
  const navigate = useNavigate();
  const { backendUrl, userData, token, setShowVerifyPopup } = useContext(ShopContext);

  const handleVerifyClick = () => {
    setShowVerifyPopup(false);
    onClose();
    navigate('/emailverify');
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl p-8 w-full max-w-md relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>

          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4"
            >
              <HiOutlineExclamationCircle className="w-8 h-8 text-yellow-600" />
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Email Not Verified
            </h2>
            
            <p className="text-gray-600 mb-6">
              Your email address hasn't been verified yet. Please verify your email to access all features.
            </p>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleVerifyClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <HiOutlineMailOpen className="w-5 h-5" />
                Click to Verify
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Remind Me Later
              </motion.button>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              You'll be reminded again in 3 minutes
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PopupVerify;
