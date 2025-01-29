import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import { toast } from 'react-toastify'; // Add this import
import { motion } from 'framer-motion'; // Add this import
const Product = () => {
    const { productId } = useParams(); // Change from id to productId to match route param
    const { products, addToCart, currency, cartItems } = useContext(ShopContext);
    const [selectedSize, setSelectedSize] = useState('');
    const [localSizes, setLocalSizes] = useState([]);
    const [quantityLeft, setQuantityLeft] = useState(0);
    const [productData, setProductData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [image, setImage] = useState(null); // Add this state

    // First, add a helper function to calculate discounted price
    const getDiscountedPrice = () => {
        if (!productData?.discount) return productData?.price || 0;
        
        const discountedPrice = productData.discount.discountType === 'percentage'
            ? productData.price * (1 - productData.discount.discountValue / 100)
            : productData.price - productData.discount.discountValue;
            
        return Math.max(0, Math.round(discountedPrice * 100) / 100);
    };

    // Update product data and sizes when products or cart changes
    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);
            setError(null);
            
            try {
                if (!productId || !products.length) return;
                
                const product = products.find(item => item._id === productId);
                if (product) {
                    setProductData(product);
                    const validSizes = product.sizes
                        .filter(size => ['S', 'M', 'L', 'XL', 'XXL'].includes(size.size))
                        .map(size => ({
                            ...size,
                            quantity: Math.max(0, size.quantity - (cartItems[productId]?.[size.size] || 0))
                        }));
                    setLocalSizes(validSizes);
                    setImage(product.image[0]);
                    
                    // Update quantity if size is selected
                    if (selectedSize) {
                        const sizeData = validSizes.find(s => s.size === selectedSize);
                        setQuantityLeft(sizeData?.quantity || 0);
                    }
                }
            } catch (error) {
                console.error('Error loading product:', error);
                setError('Error loading product');
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [products, productId, cartItems, selectedSize]);

    const handleAddToCart = async () => {
        if (!selectedSize) {
            toast.error('Please select a size first!');
            return;
        }

        const sizeData = localSizes.find(s => s.size === selectedSize);
        if (!sizeData || sizeData.quantity === 0) {
            toast.error('Selected size is out of stock!');
            return;
        }

        await addToCart(productId, selectedSize);
        
        // Update local sizes after cart addition
        setLocalSizes(prevSizes => 
            prevSizes.map(sizeData => 
                sizeData.size === selectedSize 
                    ? { ...sizeData, quantity: Math.max(0, sizeData.quantity - 1) }
                    : sizeData
            )
        );
    };

    // Show loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // Show error state
    if (error || !productData) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen gap-4">
                <p className="text-xl text-gray-600">{error || 'Product not found'}</p>
                <button 
                    onClick={() => window.history.back()}
                    className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return productData ? (
        <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
            <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
                {/* Product Images */}
                <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
                    <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
                        {productData.image.map((item, index) => (
                            <img 
                                onClick={() => setImage(item)} 
                                src={item} 
                                key={index} 
                                className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' 
                                alt="" 
                            />
                        ))}
                    </div>
                    <div className='w-full sm:w-[80%]'>
                        <img className='w-full h-auto' src={image} alt="" />
                    </div>
                </div>

                {/* Product Info */}
                <div className='flex-1'>
                    <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
                    <div className='flex items-center gap-1 mt-2'>
                        {/* Rating stars */}
                        <div className="flex gap-1">
                            {[1,2,3,4].map(star => (
                                <img key={star} src={assets.star_icon} alt="" className="w-3.5" />
                            ))}
                            <img src={assets.star_dull_icon} alt="" className="w-3.5" />
                        </div>
                        <p className='pl-2'>(122)</p>
                    </div>
                    <div className="flex items-center gap-4 mt-5">
                        {productData.discount ? (
                            <>
                                <motion.p 
                                    className="text-3xl font-medium text-red-600"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {currency}{getDiscountedPrice()}
                                </motion.p>
                                <motion.p 
                                    className="text-xl text-gray-500 line-through"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {currency}{productData.price}
                                </motion.p>
                                <motion.span 
                                    className="bg-red-500 text-white px-2 py-1 rounded-full text-sm"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                >
                                    {productData.discount.discountType === 'percentage'
                                        ? `-${productData.discount.discountValue}%`
                                        : `-${currency}${productData.discount.discountValue}`}
                                </motion.span>
                                
                                {/* Add discount validity */}
                                {productData.discount.endDate && (
                                    <motion.p 
                                        className="text-sm text-gray-500"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        Valid until {new Date(productData.discount.endDate).toLocaleDateString()}
                                    </motion.p>
                                )}
                            </>
                        ) : (
                            <p className="text-3xl font-medium">{currency}{productData.price}</p>
                        )}
                    </div>
                    <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
                    
                    {/* Size Selection */}
                    <div className='flex flex-col gap-4 my-8'>
                        <p>Select Size</p>
                        <div className='flex gap-2'>
                            {localSizes.map((sizeData, index) => (
                                <button 
                                    key={index}
                                    onClick={() => setSelectedSize(sizeData.size)}
                                    disabled={sizeData.quantity === 0}
                                    className={`
                                        border py-2 px-4 bg-gray-100
                                        ${sizeData.quantity === 0 
                                            ? 'opacity-50 cursor-not-allowed' 
                                            : selectedSize === sizeData.size 
                                                ? 'border-orange-500' 
                                                : ''
                                        }
                                    `}
                                >
                                    {sizeData.size}
                                    <span className="text-xs ml-1">({sizeData.quantity})</span>
                                </button>
                            ))}
                        </div>
                        {selectedSize && quantityLeft === 0 && (
                            <p className="text-red-500 text-sm">Selected size is out of stock!</p>
                        )}
                    </div>

                    <div className='bg-white p-6 rounded-lg shadow-lg'>
                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedSize || quantityLeft === 0}
                            className={`
                                w-full transition-all duration-300 rounded-lg font-medium py-3.5 px-8
                                ${!selectedSize 
                                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                                    : quantityLeft === 0 
                                        ? 'bg-red-500 text-white cursor-not-allowed opacity-75'
                                        : 'bg-[#00BFAE] text-white hover:bg-[#00A38B] transform hover:scale-[1.02]'
                                }
                                disabled:bg-gray-400 disabled:cursor-not-allowed
                                flex items-center justify-center gap-2 shadow-lg
                            `}
                        >
                            {!selectedSize ? (
                                <>
                                    <span className="animate-bounce">👆</span>
                                    SELECT SIZE
                                </>
                            ) : quantityLeft === 0 ? (
                                <>
                                    <span className="animate-pulse">⚠️</span>
                                    OUT OF STOCK
                                </>
                            ) : (
                                <>
                                    <span className="animate-bounce">🛒</span>
                                    ADD TO CART
                                </>
                            )}
                        </button>

                        {/* Product Information */}
                        <div className='mt-8 border-t border-gray-200 pt-6'>
                            <div className='space-y-4 text-sm text-gray-600'>
                                <div className='flex items-center gap-2'>
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <p>100% Original product</p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                    </svg>
                                    <p>Cash on delivery available</p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <p>Easy 7-day returns & exchanges</p>
                                </div>
                            </div>
                        </div>

                        {/* Related Products Section */}
                        <div className="mt-12">
                            <RelatedProducts 
                                category={productData.category} 
                                subCategory={productData.subCategory} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : null;
};

export default Product;
