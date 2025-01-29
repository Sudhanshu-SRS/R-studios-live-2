import React from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';
import { 
    HiTag, 
    HiPlus, 
    HiViewList, 
    HiShoppingCart, 
    HiPhotograph,
    HiChartBar 
} from 'react-icons/hi';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const sidebarItems = [
        { path: "/add", icon: <HiPlus className="w-5 h-5" />, label: "Add Items" },
        { path: "/list", icon: <HiViewList className="w-5 h-5" />, label: "List Items" },
        { path: "/orders", icon: <HiShoppingCart className="w-5 h-5" />, label: "Orders" },
        { path: "/admin", icon: <HiPhotograph className="w-5 h-5" />, label: "Slider Image" },
        { path: "/analytics", icon: <HiChartBar className="w-5 h-5" />, label: "Analytics" },
        { path: "/discounts", icon: <HiTag className="w-5 h-5" />, label: "Discounts" }
    ];

    return (
        <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className='w-[18%] min-h-screen bg-white border-r border-gray-200 shadow-lg'
        >
            {/* <div className='flex justify-center py-6 border-b border-gray-100'>
                <motion.img 
                    src={assets.logo}
                    alt="R-Studio Admin"
                    className="w-32 transition-all duration-300 hover:scale-110"
                    whileHover={{ rotate: 180 }}
                />
            </div> */}

            <div className='flex flex-col gap-2 p-4'>
                {sidebarItems.map((item, index) => (
                    <NavLink 
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-lg
                            transition-all duration-300 ease-in-out
                            hover:bg-gray-50 hover:shadow-md
                            ${isActive 
                                ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100' 
                                : 'text-gray-600 hover:text-blue-600'
                            }
                        `}
                    >
                        <motion.div
                            initial={{ scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {item.icon}
                        </motion.div>
                        <motion.p 
                            className='hidden md:block font-medium'
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            {item.label}
                        </motion.p>
                    </NavLink>
                ))}
            </div>

            <div className="mt-auto p-4">
                <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-100">
                    <p className="text-sm text-blue-600 font-medium mb-2">Admin Dashboard</p>
                    <p className="text-xs text-gray-600">Manage your products, orders, and more</p>
                </div>
            </div>
        </motion.div>
    );
};

export default Sidebar;