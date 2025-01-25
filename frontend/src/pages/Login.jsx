import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { auth, provider, signInWithPopup } from "../config/firebase";
import { assets } from "../mern-assets/assets";
import { useSpring, animated } from 'react-spring'; // Import for animation

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(""); // For email validation error
  const [passwordError, setPasswordError] = useState(""); // For password validation error

  // Animations for the form and inputs
  const formStyle = useSpring({
    opacity: 1,
    transform: "scale(1)",
    from: { opacity: 0, transform: "scale(0.95)" },
    config: { tension: 150, friction: 20 },
  });

  const inputStyle = useSpring({
    opacity: 1,
    transform: "translateY(0)",
    from: { opacity: 0, transform: "translateY(30px)" },
    config: { tension: 170, friction: 15 },
  });

  const buttonStyle = useSpring({
    transform: "scale(1)",
    from: { transform: "scale(0.95)" },
    config: { tension: 200, friction: 15 },
    reset: true,
    reverse: currentState === "Sign Up",  // Add reset effect if state changes
  });

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

    // // Validate email and password
    // if (!validateEmail(email)) {
    //   setEmailError("Please enter a valid email address.");
    //   return;
    // }
    // if (!validatePassword(password)) {
    //   setPasswordError("Password must be at least 6 characters long and contain both letters and numbers.");
    //   return;
    // }

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
          navigate('/'); // Navigate after successful registration
        } else {
          toast.error(response.data.message);
        }
      } else {
        response = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          navigate('/'); // Navigate after successful login
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
      const token = await user.getIdToken();
      setToken(token);
      localStorage.setItem("token", token);
      navigate("/"); // Redirect to home page after Google sign-in
      toast.success(`Welcome ${user.displayName}`);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/"); // If already logged in, navigate to the home page
    }
  }, [token, navigate]);

  return (
    <animated.form
      onSubmit={onSubmitHandler}
      style={formStyle} // Apply form animation
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {currentState === "Sign Up" && (
        <animated.div style={inputStyle} className="flex items-center w-full px-3 py-2 border border-gray-800">
          <img src={assets.person_icon} alt="person icon" className="w-5 h-5 mr-2" />
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            className="flex-1 outline-none"
            placeholder="Name"
            required
          />
        </animated.div>
      )}

      <animated.div style={inputStyle} className="flex items-center w-full px-3 py-2 border border-gray-800">
        <img src={assets.mail_icon} alt="email icon" className="w-5 h-5 mr-2" />
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          className="flex-1 outline-none"
          placeholder="Email"
          required
        />
      </animated.div>
      {emailError && <p className="text-red-500 text-sm">{emailError}</p>} {/* Display email error */}

      <animated.div style={inputStyle} className="flex items-center w-full px-3 py-2 border border-gray-800">
        <img src={assets.lock_icon} alt="lock icon" className="w-5 h-5 mr-2" />
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          className="flex-1 outline-none"
          placeholder="Password"
          required
        />
      </animated.div>
      {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>} {/* Display password error */}

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="px-4 py-2 border flex gap-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:shadow transition duration-150 font-light px-8 py-2 mt-4"
      >
        <img
          className="w-6 h-6"
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          loading="lazy"
          alt="google logo"
        />
        Sign in with Google
      </button>

      <div className="w-full flex justify-between text-sm mt-[-8px]">
        {currentState === "Login" && (
          <p className="cursor-pointer">Forgot your password?</p>
        )}
        {currentState === "Login" ? (
          <p onClick={() => setCurrentState("Sign Up")} className="cursor-pointer">
            Create account
          </p>
        ) : (
          <p className="text-center w-full">
            Already have an account?{" "}
            <span onClick={() => setCurrentState("Login")} className="cursor-pointer underline">
              Login Here
            </span>
          </p>
        )}
      </div>

      <animated.button
        className="bg-black text-white font-light px-8 py-2 mt-4"
        style={buttonStyle} // Apply button animation
      >
        {currentState === "Login" ? "Sign In" : "Sign Up"}
      </animated.button>
    </animated.form>
  );
};

export default Login;
