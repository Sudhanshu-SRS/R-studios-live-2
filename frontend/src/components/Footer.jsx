import React from "react";
import { assets } from "../assets/assets";
import { Link} from "react-router-dom";

const Footer = () => {
  return (
    <div>
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        <div>
          <img src={assets.logo} className="mb-5 w-32" alt="" />
          <p className="w-full md:w-2/3 text-gray-600">
            R STUDIO NAGPUR BIGGEST LEHANGA WHOLESALE MARKET PRIMIUM BRAND WE
            ARE DEALING IN TRADITIONAL SAREES BRIDAL LEHENGA ETC
          </p>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li><Link to="/" className="hover:text-black transition-colors">Home</Link></li>
            <li><Link to="/about" className="hover:text-black transition-colors">About us</Link></li>
            <li><Link to="/orders" className="hover:text-black transition-colors">Order</Link></li>
            <li><Link to="/privacy" className="hover:text-black transition-colors">Privacy policy</Link></li>
            <li><Link to="/return" className="hover:text-black transition-colors">Return & Refund Policy</Link></li>

          </ul>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH </p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>+91-9764804422</li>
            <li>Rashifashionoffice@gmail.com</li>
          </ul>
        </div>
      </div>

      <div>
        <hr />
        <p className="py-2 text-sm text-center">
          Copyright 2024@ R-studio.com - All Right Reserved.
        </p>
        <p className="py-5 text-sm text-center">
          Crafted With ❤️ By Carnegie Tech X
        </p>
      </div>
    </div>
  );
};

export default Footer;
