import React, { useContext, useEffect, useRef, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import axios from "axios";
import { motion } from "framer-motion";
import { HiOutlineMail, HiOutlineClock } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const EmailVerify = () => {
  const { backendUrl, isLoggedIn, userData, getUserData, token, navigate } = useContext(ShopContext);
  const inputRefs = useRef([]);
  const [timeLeft, setTimeLeft] = useState(0); // Initialize to 0 instead of 15 * 60
  const [isExpired, setIsExpired] = useState(true); // Start with expired state
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initial data load
  useEffect(() => {
    const initializeComponent = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setIsInitializing(true);
        await getUserData(); // Wait for user data to load
      } finally {
        setIsInitializing(false);
      }
    };

    initializeComponent();
  }, [token]);

  useEffect(() => {
    if (isLoggedIn && userData?.isAccountVerified) {
      navigate("/");
    }
  }, [isLoggedIn, userData, navigate]);

  // Timer logic - Only runs when timeLeft > 0
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleInput = (e, index) => {
    const value = e.target.value;
    if (value.length === 1 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const digits = paste.match(/\d/g)?.slice(0, 6) || [];
    digits.forEach((digit, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = digit;
        if (index < inputRefs.current.length - 1) {
          inputRefs.current[index + 1].focus();
        }
      }
    });
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Please login first");
      navigate('/login');
      return;
    }

    const otp = inputRefs.current.map(ref => ref.value).join("");
      
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/verify-email`,
        { 
          userId: userData._id, 
          otp 
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        toast.success("Email verified successfully!");
        localStorage.removeItem('verificationInProgress'); // Add this line
        await getUserData(); // Refresh user data after verification
        navigate("/");
      } else {
        toast.error(response.data.message || "Verification failed");
      }
    } catch (error) {
      console.error('Verification error:', error);
      if (error?.response?.status === 401) {
        toast.error("Session expired. Please login again");
        navigate('/login');
      } else {
        toast.error(error?.response?.data?.message || "Verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!isExpired && timeLeft > 0) {
      toast.warning(`Please wait ${formatTime(timeLeft)} before requesting new OTP`);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/send-verify-otp`,
        { userId: userData?._id },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setTimeLeft(15 * 60); // Start 15-minute timer
        setIsExpired(false); // Reset expired state
        toast.success("Verification code sent successfully");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
          className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4"
          >
            <HiOutlineMail className="w-8 h-8 text-teal-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
          <p className="text-gray-600 mb-6">
            {timeLeft > 0 ? "Enter the verification code sent to your email" : "Click the button below to receive verification code"}
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleResendOTP}
            disabled={loading || (!isExpired && timeLeft > 0)}
            className={`w-full py-3 rounded-lg font-medium text-white 
              ${loading || (!isExpired && timeLeft > 0) 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-teal-600 hover:bg-teal-700'} 
              transition-colors mb-6`}
          >
            {loading ? 'Sending...' : 'Send Verification OTP'}
          </motion.button>

          {timeLeft > 0 && (
            <>
              <div className="flex items-center gap-2 justify-center text-sm mb-6">
                <HiOutlineClock className="w-4 h-4 text-teal-500" />
                <span className="text-teal-500">
                  Time remaining: {formatTime(timeLeft)}
                </span>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                  {Array(6).fill(0).map((_, index) => (
                    <motion.input
                      key={index}
                      type="text"
                      maxLength={1}
                      pattern="\d"
                      required
                      className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg
                        ${isExpired ? 'bg-gray-50 border-gray-200' : 'border-gray-300'}
                        focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500
                        transition-colors`}
                      ref={el => inputRefs.current[index] = el}
                      onInput={e => handleInput(e, index)}
                      onKeyDown={e => handleKeyDown(e, index)}
                      disabled={isExpired || loading}
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isExpired || loading}
                  className={`w-full py-3 rounded-lg font-medium text-white
                    ${isExpired || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'}
                    transition-colors shadow-lg`}
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </motion.button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const PopupVerify = ({ onClose }) => {
  const navigate = useNavigate();
  const { backendUrl, userData, token, setShowVerifyPopup } = useContext(ShopContext);

  const handleVerifyClick = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/send-verify-otp`,
        { userId: userData?._id },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        toast.success("Verification code sent to your email");
        setShowVerifyPopup(false); // Prevent popup from showing again
        localStorage.setItem('verificationInProgress', 'true'); // Add this line
        onClose();
        navigate('/emailverify');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send verification code");
    }
  };
};

export default EmailVerify;
