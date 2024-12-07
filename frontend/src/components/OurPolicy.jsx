import React from "react";
import { assets } from "../assets/assets";

const OurPolicy = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700">
      <div>
        <img src={assets.sharrr} className="w-[79px] m-auto mb-5" alt="" />
        <p className=" font-semibold">MADE IN INDIA</p>
      </div>
      <div>
        <img src={assets.quality_icon} className="w-12 m-auto mb-5" alt="" />
        <p className=" font-semibold">ASSURED QUALITY</p>
      </div>
      <div>
        <img src={assets.pay} className="w-[79px] m-auto mb-5" alt="" />
        <p className=" font-semibold">SECURE PAYMENTS</p>
      </div>
    </div>
  );
};

export default OurPolicy;
