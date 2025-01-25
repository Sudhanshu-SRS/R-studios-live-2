import React, { useState, useContext, useEffect , useRef} from "react";
import Draggable from "react-draggable";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";

const PopupVerify = ({ onClose }) => {
  const { backendUrl, userData, token, isAccountVerified } = useContext(ShopContext);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false); // Button loading state
  const [isVisible, setIsVisible] = useState(false); // Controls popup visibility
  const navigate = useNavigate();
  const timerRef = useRef(null); // Timer reference to clear timeout on component unmount

  useEffect(() => {
    // Check if user is not verified and show the popup
    if (userData && !isAccountVerified) {
      setIsVisible(true);
    }
  }, [userData, isAccountVerified]);

  const sendVerificationOTPHandler = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/send-verify-otp`,
        { userId: userData?._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Verification OTP sent successfully");
        navigate("/emailverify");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Verification error:", error);
      if (error?.response?.status === 401) {
        toast.error("Session expired. Please login again");
        navigate("/login");
      } else {
        toast.error("Failed to send verification OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false); // Hide the popup
    if (onClose) onClose();

    // Set a timer to show the popup again after 3 minutes
    clearTimeout(timerRef.current); // Clear any previous timer
    timerRef.current = setTimeout(() => {
      if (userData && !isAccountVerified) {
        setIsVisible(true); // Show the popup again if the user is still unverified
      }
    }, 180000); // 3 minutes
  };

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current); // Cleanup timeout on component unmount
    };
  }, []);

  if (!isVisible || isAccountVerified) {
    return null; // Don't render if popup is hidden or user is verified
  }

  return (
    <Draggable
      handle=".handle"
      onStart={() => setIsDragging(true)}
      onStop={() => setIsDragging(false)}
    >
      <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="relative bg-white rounded-xl shadow-lg w-full max-w-lg">
          {/* Header */}
          <div className="handle flex justify-between items-center bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-4 rounded-t-xl">
            <h3 className="text-lg font-semibold">Email Verification</h3>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/10 rounded-full p-1"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3 text-indigo-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="text-lg font-medium">
                Hello, {userData?.name || "User"}!
              </span>
            </div>
            <p className="text-gray-700 text-sm">
              Verify your email address (
              <span className="font-medium text-gray-800">
                {userData?.email || "your registered email"}
              </span>
              ) to unlock full features:
            </p>

            <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
              <li>Enable account recovery options</li>
              <li>Access exclusive features</li>
              <li>Enhance your account's security</li>
            </ul>

            <button
              onClick={sendVerificationOTPHandler}
              className={`w-full py-3 text-white rounded-md ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 transition"
              }`}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Verification Email"}
            </button>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default PopupVerify;
