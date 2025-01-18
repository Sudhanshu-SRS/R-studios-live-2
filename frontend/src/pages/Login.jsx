import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { auth, provider, signInWithPopup } from "../config/firebase";
import { assets } from "../mern-assets/assets";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currentState === "Sign Up") {
        const response = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();
      setToken(token);
      localStorage.setItem("token", token);
      navigate("/");
      toast.success(`Welcome ${user.displayName}`);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>
      {currentState === "Sign Up" && (
        <div className="flex items-center w-full px-3 py-2 border border-gray-800">
          <img
            src={assets.person_icon}
            alt="person icon"
            className="w-5 h-5 mr-2 "
          />
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            className="flex-1 outline-none"
            placeholder="Name"
            required
          />
        </div>
      )}
      <div className="flex items-center w-full px-3 py-2 border border-gray-800">
        <img src={assets.mail_icon} alt="email icon" className="w-5 h-5 mr-2" />
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          className="flex-1 outline-none"
          placeholder="Email"
          required
        />
      </div>
      <div className="flex items-center w-full px-3 py-2 border border-gray-800">
        <img src={assets.lock_icon} alt="lock icon" className="w-5 h-5 mr-2" />
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          className="flex-1 outline-none"
          placeholder="Password"
          required
        />
      </div>
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
    <p
      onClick={() => setCurrentState("Sign Up")}
      className="cursor-pointer"
    >
      Create account
    </p>
  ) : (
    <p className="text-center w-full"
      
    >
      All Ready Have An Accoutn?{''} 
      <span
      onClick={() => setCurrentState("Login")}
     
       className="cursor-pointer underline"> Login Here</span> 
    </p>
  )}
</div>

      <button className="bg-black text-white font-light px-8 py-2 mt-4">
        {currentState === "Login" ? "Sign In" : "Sign Up"}
      </button>
    </form>
  );
};

export default Login;
