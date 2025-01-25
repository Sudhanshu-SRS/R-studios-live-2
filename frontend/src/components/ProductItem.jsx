import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const ProductItem = ({ id, image, name, price }) => {
    const { currency } = useContext(ShopContext);

    return (
        <Link
            onClick={() => scrollTo(0, 0)}
            className='group relative text-gray-700 cursor-pointer transform transition-all duration-500 ease-in-out'
            to={`/product/${id}`}
        >
            <div
                className='relative overflow-hidden rounded-2xl shadow-xl transition-all duration-700 ease-in-out transform group-hover:scale-105 group-hover:shadow-2xl group-hover:ring-4 group-hover:ring-indigo-500'
                style={{ perspective: '1200px' }}
            >
                <div className='transition-transform duration-700 ease-in-out transform group-hover:rotate-2'>
                    <img
                        className='group-hover:scale-110 transition-all duration-500 group-hover:brightness-125'
                        src={image[0]}
                        alt={name}
                    />
                    {/* Radiating Shine Effect */}
                    <div className='shine absolute inset-0 bg-gradient-radial from-transparent via-silver to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700'></div>
                </div>
            </div>

            {/* Product Text */}
            <div className='pt-4 pb-2 group-hover:opacity-0 transition-opacity duration-300'>
                <p className='text-sm font-medium text-gray-800 group-hover:text-transparent transition-colors duration-300'>
                    {name}
                </p>
                <p className='text-lg font-semibold text-gray-900 group-hover:text-transparent transition-colors duration-300'>
                    {currency}{price}
                </p>
            </div>

            {/* Buttons (Initially hidden, shown on hover) */}
            <div className='absolute bottom-0 left-0 right-0 text-center pb-4'>
                <div className='opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-4 transition-opacity duration-500'>
                    <button
                        className='w-full py-2 mt-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-300'
                    >
                        Add to Cart
                    </button>
                    <button
                        className='w-full py-2 mt-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-300'
                    >
                        Buy Now
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default ProductItem;
