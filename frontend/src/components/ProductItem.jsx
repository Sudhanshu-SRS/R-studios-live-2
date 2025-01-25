import React, { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const ProductItem = ({ id, image, name, price }) => {
    const { currency, addToCart, navigate } = useContext(ShopContext);
    const [selectedSize, setSelectedSize] = useState('M'); // Default size

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await addToCart(id, selectedSize);
    };

    const handleBuyNow = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(id, selectedSize).then(() => {
            navigate('/place-order');
        });
    };

    return (
        <Link
            onClick={() => scrollTo(0, 0)}
            className='group relative text-gray-700 cursor-pointer transform transition-all duration-300 ease-in-out'
            to={`/product/${id}`}
        >
            <div
                className='relative overflow-hidden rounded-2xl shadow-xl transition-all duration-500 ease-in-out transform group-hover:scale-105 group-hover:shadow-lg group-hover:ring-2 group-hover:ring-gray-300 group-hover:scale-110'
                style={{ perspective: '1200px' }}
            >
                <div className='transition-transform duration-500 ease-in-out transform group-hover:rotate-1'>
                    <img
                        className='group-hover:scale-105 transition-all duration-300 ease-in-out group-hover:brightness-110 group-hover:shadow-lg'
                        src={image[0]}
                        alt={name}
                    />
                    <div className='shine absolute inset-0 bg-gradient-radial from-transparent via-silver to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                </div>
            </div>

            {/* Product Text */}
            <div className='pt-4 pb-2 group-hover:opacity-0 transition-opacity duration-500'>
                <p className='text-sm font-medium text-gray-800 group-hover:text-transparent transition-colors duration-300'>
                    {name}
                </p>
                <p className='text-lg font-semibold text-gray-900 group-hover:text-transparent transition-colors duration-300'>
                    {currency}{price}
                </p>
            </div>

            {/* Buttons with Size Selection */}
            <div className='absolute bottom-0 left-0 right-0 text-center pb-4'>
                <div className='opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-4 transition-opacity duration-500'>
                    {/* Size Selection */}
                    <div className='flex justify-center gap-2 mb-2'>
                        {['S', 'M', 'L', 'XL'].map((size) => (
                            <button
                                key={size}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedSize(size);
                                }}
                                className={`px-2 py-1 text-xs rounded transform transition-all duration-300 ease-in-out ${
                                    selectedSize === size
                                        ? 'bg-teal-500 text-white scale-95'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-100'
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>

                    {/* Mobile: Always Visible */}
                    <div className='lg:hidden block'>
                        <button
                            onClick={handleAddToCart}
                            className='w-full py-2 mt-3 bg-[#00BFAE] text-white font-semibold rounded-lg hover:bg-[#00A38B] transition-all duration-300 transform hover:scale-105 hover:shadow-xl'
                        >
                            🛒 Add to Cart
                        </button>
                        <button
                            onClick={handleBuyNow}
                            className='w-full py-2 mt-3 bg-[#A17DFF] text-white font-semibold rounded-lg hover:bg-[#8B64E5] transition-all duration-300 transform hover:scale-105 hover:shadow-xl'
                        >
                            🚀 Buy Now
                        </button>
                    </div>

                    {/* Desktop: Show Buttons Only on Hover */}
                    <div className='lg:block hidden'>
                        <button
                            onClick={handleAddToCart}
                            className='w-full py-2 mt-3 bg-[#00BFAE] text-white font-semibold rounded-lg hover:bg-[#00A38B] transition-all duration-300 transform hover:scale-105 hover:shadow-xl'
                        >
                            🛒 Add to Cart
                        </button>
                        <button
                            onClick={handleBuyNow}
                            className='w-full py-2 mt-3 bg-[#A17DFF] text-white font-semibold rounded-lg hover:bg-[#8B64E5] transition-all duration-300 transform hover:scale-105 hover:shadow-xl'
                        >
                            🚀 Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductItem;
