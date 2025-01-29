import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const Footer = () => {
  // Function to handle scroll to top on link click
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // This makes the scroll smooth
    });
  };

  return (
    <div className="bg-gray-100">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm p-6 md:p-14 transition-all duration-300 ease-in-out">
        <div className="flex flex-col gap-4">
          <img
            src={assets.logo}
            className="mb-5 w-32 transition-transform duration-500 ease-in-out hover:scale-105"
            alt="Logo"
          />
          <p className="w-full md:w-2/3 text-gray-600 opacity-80 hover:opacity-100 transition-opacity duration-300 ease-in-out font-poppins text-lg">
            R STUDIO NAGPUR BIGGEST LEHANGA WHOLESALE MARKET PRIMIUM BRAND WE
            ARE DEALING IN TRADITIONAL SAREES BRIDAL LEHENGA ETC
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-xl font-bold mb-5 text-gray-800 font-poppins uppercase tracking-wide">
            COMPANY
          </p>
          <ul className="flex flex-col gap-3 text-gray-600">
            <li>
              <Link
                to="/"
                className="hover:text-[#00BFAE] transition-all duration-300 transform hover:scale-105 font-poppins"
                onClick={scrollToTop} // Ensure scroll to top on click
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="hover:text-[#00BFAE] transition-all duration-300 transform hover:scale-105 font-poppins"
                onClick={scrollToTop}
              >
                About us
              </Link>
            </li>
            <li>
              <Link
                to="/orders"
                className="hover:text-[#00BFAE] transition-all duration-300 transform hover:scale-105 font-poppins"
                onClick={scrollToTop}
              >
                Order
              </Link>
            </li>
            <li>
              <Link
                to="/privacy"
                className="hover:text-[#00BFAE] transition-all duration-300 transform hover:scale-105 font-poppins"
                onClick={scrollToTop}
              >
                Privacy policy
              </Link>
            </li>
            <li>
              <Link
                to="/return"
                className="hover:text-[#00BFAE] transition-all duration-300 transform hover:scale-105 font-poppins"
                onClick={scrollToTop}
              >
                Return & Refund Policy
              </Link>
            </li>
            <li>
              <Link
                to="/shipping-policy"
                className="hover:text-[#00BFAE] transition-all duration-300 transform hover:scale-105 font-poppins"
                onClick={scrollToTop}
              >
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="hover:text-[#00BFAE] transition-all duration-300 transform hover:scale-105 font-poppins"
                onClick={scrollToTop}
              >
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-xl font-bold mb-5 text-gray-800 font-poppins uppercase tracking-wide">
            GET IN TOUCH
          </p>
          <ul className="flex flex-col gap-3 text-gray-600">
            <li className="hover:text-[#00BFAE] transition-all duration-300 transform hover:scale-105 font-poppins flex items-center gap-2">
              <i className="fas fa-phone-alt text-[#00BFAE]"></i> +91-9764804422
            </li>
            <li className="hover:text-[#00BFAE] transition-all duration-300 transform hover:scale-105 font-poppins flex items-center gap-2">
              <i className="fas fa-envelope text-[#00BFAE]"></i> Rashifashionoffice@gmail.com
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-200 py-5">
        <hr />
        <p className="py-2 text-sm text-center text-gray-600 font-poppins">
          Copyright 2024@ R-studio.com - All Right Reserved.
        </p>
        <p className="py-5 text-sm text-center text-gray-600 font-poppins">
          Crafted With ❤️ By Carnegie Tech X
        </p>
      </div>
    </div>
  );
};

export default Footer;
