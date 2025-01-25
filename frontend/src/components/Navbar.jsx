import React, { useContext, useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { useSpring, animated } from 'react-spring';

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const [dropdownVisible, setDropdownVisible] = useState(false); // For handling dropdown visibility
  const [dropdownItemsAnimation, setDropdownItemsAnimation] = useState([0, 0, 0]); // For animating each dropdown item

  const { setShowSearch, getCartCount, navigate, token, setToken, setCartItems } = useContext(ShopContext);
  
  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      setScrollDirection('down'); // Hide navbar
    } else {
      setScrollDirection('up'); // Show navbar
    }

    setLastScrollY(currentScrollY);
    setScrolled(currentScrollY > 50); // Add shadow and background
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navbarStyles = useSpring({
    transform: scrollDirection === 'up' ? 'translateY(0%)' : 'translateY(-100%)',
    backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
    boxShadow: scrolled ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none',
    borderBottom: scrolled ? '1px solid rgba(200, 200, 200, 0.5)' : 'none',
    config: { tension: 250, friction: 20 },
    reset: true,
    immediate: scrollDirection === 'down',
  });

  const logout = () => {
    navigate('/login');
    localStorage.removeItem('token');
    setToken('');
    setCartItems({});
  };

  // Handle dropdown hover or click
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
    setDropdownItemsAnimation(dropdownVisible ? [0, 0, 0] : [1, 2, 3]); // Animate items one by one
  };

  // Fix the navigation links array and home path
  const navigationLinks = [
    { name: 'HOME', path: '/' },
    { name: 'COLLECTION', path: '/collection' },
    { name: 'ABOUT', path: '/about' },
    { name: 'CONTACT', path: '/contact' }
  ];

  return (
    <animated.div style={navbarStyles} className="fixed top-0 left-0 w-full z-50 transition-transform">
      <div className="flex items-center justify-between py-4 px-6 font-medium bg-gradient-to-r from-gray-200 to-gray-300">
        <Link to="/" className="relative">
          <animated.img
            src={assets.logo}
            className="w-32 transform transition-all duration-500 ease-in-out hover:scale-110 hover:rotate-3 hover:drop-shadow-xl"
            alt="R-Studio"
            style={{
              filter: 'brightness(0.8) contrast(2.2) drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.25))',
              animation: 'float 2s ease-in-out infinite,glow 2s ease-in-out infinite',
            }}
          />
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden sm:flex gap-10 text-sm font-semibold text-gray-700">
          {navigationLinks.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className="relative group flex flex-col items-center gap-1 duration-300 ease-in-out transform hover:scale-110"
            >
              <p>{item.name}</p>
              <span className="w-0 h-[2px] bg-teal-500 transition-all duration-300 group-hover:w-full"></span>
            </NavLink>
          ))}
        </ul>

        <div className="flex items-center gap-6">
          <img
            onClick={() => { setShowSearch(true); navigate('/collection'); }}
            src={assets.search_icon}
            className="w-6 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110"
            alt="Search"
          />

          <div className="relative group">
            <img
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling
                toggleDropdown();
              }}
              src={assets.profile_icon}
              className="w-6 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110"
              alt="Profile"
            />

            {dropdownVisible && (
              <div className="absolute right-0 pt-4 z-10 w-48 py-3 px-5 bg-white text-gray-800 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300">
                {['My Profile', 'Orders', 'Logout'].map((text, index) => (
                  <animated.p
                    key={index}
                    onClick={text === 'Logout' ? logout : () => navigate(`/${text.toLowerCase().replace(" ", "")}`)}
                    className="cursor-pointer hover:text-teal-500 flex items-center gap-2"
                    style={{
                      opacity: dropdownItemsAnimation[index] === 0 ? 0 : 1,
                      transform: dropdownItemsAnimation[index] === 0 ? 'translateY(-20px)' : 'translateY(0px)',
                      transition: `opacity 0.3s, transform 0.3s ${index * 0.3}s`, // Sequential animation
                    }}
                  >
                    {text === 'My Profile' && '👤'} {text === 'Orders' && '🛒'} {text === 'Logout' && '🚪'} {text}
                  </animated.p>
                ))}
              </div>
            )}
          </div>

          <Link to="/cart" className="relative transition-all duration-300 ease-in-out transform hover:scale-110">
            <img src={assets.cart_icon} className="w-6" alt="Cart" />
            <p className="absolute right-[-5px] bottom-[-5px] w-5 h-5 text-center leading-5 bg-teal-500 text-white text-xs rounded-full">{getCartCount()}</p>
          </Link>

          <img
            onClick={() => setVisible(true)}
            src={assets.menu_icon}
            className="w-6 cursor-pointer sm:hidden"
            alt="Menu"
          />
        </div>

        {/* Sidebar menu for small screens */}
        <div
          className={`absolute top-0 right-0 bottom-0 bg-gradient-to-tl from-gray-200 to-gray-300 overflow-hidden transition-all duration-500 ${visible ? 'w-72' : 'w-0'}`}
        >
          <div className="flex flex-col text-gray-700">
            <div onClick={() => setVisible(false)} className="flex items-center gap-4 p-3 cursor-pointer">
              <img className="h-4 rotate-180" src={assets.dropdown_icon} alt="Back" />
              <p>Back</p>
            </div>
            {navigationLinks.map((item, index) => (
              <NavLink
                key={index}
                onClick={() => {
                  setVisible(false);
                  setDropdownVisible(false); // Close dropdown when navigating
                }}
                className="py-3 pl-6 border-b border-gray-300 hover:text-teal-500 transition-all"
                to={item.path}
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </animated.div>
  );
};

export default Navbar;
