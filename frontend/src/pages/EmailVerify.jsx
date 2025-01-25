import React, { useContext, useEffect, useRef, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const EmailVerify = () => {
  const { 
    backendUrl, 
    isLoggedIn, 
    userData, 
    getUserData,
    token 
  } = useContext(ShopContext);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    paste.split("").forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
        if (index < inputRefs.current.length - 1) {
          inputRefs.current[index + 1].focus();
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const otpArray = inputRefs.current.map((ref) => ref.value);
      const otp = otpArray.join("");

      const response = await axios.post(
        `${backendUrl}/api/user/verify-email`, 
        { 
          userId: userData?._id, 
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
        toast.success(response.data.message);
        await getUserData(); // Refresh user data
        navigate("/");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Verification error:", error);
      if (error?.response?.status === 401) {
        toast.error("Session expired. Please login again");
        navigate('/login');
      } else {
        toast.error(error?.response?.data?.message || "Failed to verify email. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (isLoggedIn && userData?.isAccountVerified) {
      navigate("/");
    }
  }, [isLoggedIn, userData, navigate]);

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

  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="bg-white shadow-2xl rounded-lg p-8 w-full max-w-lg" 
        initial={{ scale: 0.9 }} 
        animate={{ scale: 1 }} 
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Verify Your Email</h1>

        <div className="text-center mb-4">
          <p className={`text-sm ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>
            {isExpired ? 
              'OTP has expired. Please request a new one.' : 
              `Time remaining: ${formatTime(timeLeft)}`
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <motion.input
                  key={index}
                  type="text"
                  maxLength={1}
                  required
                  disabled={isExpired}
                  className={`w-12 h-12 border ${isExpired ? 'bg-gray-100 border-gray-300' : 'border-gray-300'} text-center text-xl rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                />
              ))}
          </div>
          <motion.button
            type="submit"
            disabled={isExpired}
            className={`w-full py-3 ${isExpired ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-lg transition-colors shadow-lg`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Verify Email
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Didn't receive a code?{" "}
          <motion.button
            className={`${!isExpired ? 'text-gray-400 cursor-not-allowed' : 'text-green-600'} hover:underline`}
            onClick={async () => {
                try {
                    if (!isExpired) {
                        toast.warning(`Please wait ${formatTime(timeLeft)} before requesting new OTP`);
                        return;
                    }

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
                        setTimeLeft(15 * 60); // Reset timer to 15 minutes
                        setIsExpired(false);
                        toast.success('New OTP sent successfully');
                    } else {
                        toast.error(response.data.message || 'Failed to send OTP');
                    }
                } catch (error) {
                    console.error('Resend OTP error:', error);
                    if (error?.response?.status === 401) {
                        toast.error('Session expired. Please login again');
                        navigate('/login');
                    } else {
                        toast.error(error?.response?.data?.message || 'Failed to resend OTP');
                    }
                }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Resend Code
          </motion.button>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default EmailVerify;
