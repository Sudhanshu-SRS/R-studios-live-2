import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { auth, provider, signInWithPopup } from "../config/firebase";
import { assets } from "../mern-assets/assets";
import { useSpring, animated } from 'react-spring'; // Import for animation
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  // Add error state variables
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  // Input field animation variants
  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // Example validation: Minimum 6 characters, at least one number and one letter
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return passwordRegex.test(password);
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Reset error messages
    setEmailError("");
    setPasswordError("");

    // Validate email and password
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    if (currentState === "Sign Up" && !validatePassword(password)) {
      setPasswordError("Password must be at least 6 characters long and contain both letters and numbers.");
      return;
    }

    try {
      let response;
      if (currentState === "Sign Up") {
        response = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password,
        });
        
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          navigate('/');
        } else {
          // If user already exists, switch to login state
          if (response.data.message.includes("User already exists")) {
            toast.info("Account already exists. Please login.");
            setCurrentState("Login");
            // Clear the name field but keep the email
            setName("");
            setPassword("");
          } else {
            toast.error(response.data.message);
          }
        }
      } else {
        // Rest of your login code...
        response = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          navigate('/');
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || error.message);
    }
};

  const handleGoogleSignIn = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Send Google user data to your backend instead of using Google's token directly
        const response = await axios.post(`${backendUrl}/api/user/google-auth`, {
            email: user.email,
            name: user.displayName,
            googleId: user.uid
        });

        if (response.data.success) {
            setToken(response.data.token); // Use your backend's JWT token
            localStorage.setItem("token", response.data.token);
            navigate("/");
            toast.success(`Welcome ${user.displayName}`);
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        console.error(error);
        toast.error("Failed to sign in with Google");
    }
};
  useEffect(() => {
    if (token) {
      navigate("/"); // If already logged in, navigate to the home page
    }
  }, [token, navigate]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8"
    >
      <motion.div 
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <motion.h2 className="text-3xl font-bold text-gray-900">
            {currentState === "Login" ? "Welcome Back" : "Create Account"}
          </motion.h2>
          <p className="mt-2 text-sm text-gray-600">
            {currentState === "Login" 
              ? "Sign in to your account to continue" 
              : "Join us and start shopping"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.form 
            key={currentState}
            onSubmit={onSubmitHandler}
            className="mt-8 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {currentState === "Sign Up" && (
              <motion.div 
                variants={inputVariants}
                initial="hidden"
                animate="visible"
                className="relative"
              >
                <label className="text-sm font-medium text-gray-700">Name</label>
                <div className="mt-1">
                  <input
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter your name"
                  />
                </div>
              </motion.div>
            )}

            {/* Email field */}
            <motion.div 
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1">
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  type="email"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    emailError ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500`}
                  placeholder="Enter your email"
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-500">{emailError}</p>
                )}
              </div>
            </motion.div>

            {/* Password field */}
            <motion.div 
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  type="password"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    passwordError ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500`}
                  placeholder="Enter your password"
                />
                {passwordError && (
                  <p className="mt-1 text-sm text-red-500">{passwordError}</p>
                )}
              </div>
            </motion.div>

            <div className="flex items-center justify-between">
              {currentState === "Login" && (
                <motion.p
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate('/resetpassword')}
                  className="text-sm text-teal-600 hover:text-teal-500 cursor-pointer"
                >
                  Forgot your password?
                </motion.p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none"
            >
              {currentState === "Login" ? "Sign In" : "Create Account"}
            </motion.button>

            <motion.div 
              className="relative flex items-center justify-center"
              variants={inputVariants}
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </motion.div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <img
                className="w-5 h-5"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google logo"
              />
              Sign in with Google
            </motion.button>

            <motion.p 
              className="mt-4 text-center text-sm text-gray-600"
              variants={inputVariants}
            >
              {currentState === "Login" ? (
                <>
                  Don't have an account?{" "}
                  <motion.span
                    onClick={() => setCurrentState("Sign Up")}
                    className="text-teal-600 hover:text-teal-500 cursor-pointer font-medium"
                    whileHover={{ scale: 1.05 }}
                  >
                    Sign up
                  </motion.span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <motion.span
                    onClick={() => setCurrentState("Login")}
                    className="text-teal-600 hover:text-teal-500 cursor-pointer font-medium"
                    whileHover={{ scale: 1.05 }}
                  >
                    Sign in
                  </motion.span>
                </>
              )}
            </motion.p>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Login;
