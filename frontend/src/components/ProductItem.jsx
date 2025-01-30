import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import toastify
import { motion, AnimatePresence } from 'framer-motion';

const ProductItem = ({ 
    id, 
    image, 
    name, 
    price, 
    sizes, 
    discount,
    defaultSize,
    showSizeUI = true,
    onSizeError ,
    isDisabled = false
}) => {
    const { currency, addToCart, navigate, cartItems, refreshAllProducts } = useContext(ShopContext);
    const [selectedSize, setSelectedSize] = useState(defaultSize);
    const [localSizes, setLocalSizes] = useState([]);
    const [quantityLeft, setQuantityLeft] = useState(0);

    // Update local stock using refreshAllProducts
    const updateLocalStock = async () => {
        try {
            await refreshAllProducts();
        } catch (error) {
            console.error('Error refreshing stock:', error);
        }
    };

    // Add effect to refresh stock on mount and revisit
    useEffect(() => {
        updateLocalStock();
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                updateLocalStock();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [id, cartItems]);

    // Update local sizes when props or cart changes
    useEffect(() => {
        if (sizes) {
            const updatedSizes = sizes.map(size => ({
                ...size,
                quantity: Math.max(0, size.quantity - (cartItems[id]?.[size.size] || 0))
            }));
            setLocalSizes(updatedSizes);

            if (selectedSize) {
                const sizeData = updatedSizes.find(s => s.size === selectedSize);
                if (!sizeData || sizeData.quantity === 0) {
                    setSelectedSize(null);
                }
                setQuantityLeft(sizeData?.quantity || 0);
            }

            // Check if product is out of stock
            const isOutOfStock = !updatedSizes.some(s => s.quantity > 0);
            if (isOutOfStock && onSizeError) {
                onSizeError();
            }
        }
    }, [sizes, cartItems, id, selectedSize]);

    // Listen for stock updates
    useEffect(() => {
        const handleStockUpdate = (e) => {
            if (e.detail.productId === id) {
                setLocalSizes(prev => prev.map(size => ({
                    ...size,
                    quantity: size.size === e.detail.size ? 
                        Math.max(0, size.quantity - e.detail.quantity) : 
                        size.quantity
                })));
            }
        };

        window.addEventListener('stockUpdate', handleStockUpdate);
        return () => window.removeEventListener('stockUpdate', handleStockUpdate);
    }, [id]);

    const isOutOfStock = !localSizes?.some(size => size.quantity > 0);

    const validSizes = localSizes?.filter(size => 
        ['S', 'M', 'L', 'XL', 'XXL'].includes(size.size)
    ) || [];

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!selectedSize) {
            toast.error('⚠️ Please select a size before adding to cart!');
            return;
        }

        if (quantityLeft === 0) {
            toast.error('🚫 Selected size is out of stock!');
            return;
        }

        await addToCart(id, selectedSize);
    };

    const handleBuyNow = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!selectedSize) {
            toast.error('⚠️ Please select a size before proceeding!');
            return;
        }

        addToCart(id, selectedSize).then(() => {
            navigate('/place-order');
        });
    };

    const handleSizeSelect = (sizeData) => {
        setSelectedSize(sizeData.size);
        setQuantityLeft(sizeData.quantity);
        localStorage.setItem('lastSelectedSize', sizeData.size);
        
        // Dispatch custom event for same-tab updates
        window.dispatchEvent(new CustomEvent('sizeChanged', {
            detail: { size: sizeData.size }
        }));
    };

    // Add discount animation variant
    const discountBadgeVariants = {
        initial: { scale: 0, rotate: -180 },
        animate: { 
            scale: 1, 
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 260,
                damping: 20
            }
        }
    };

    const priceVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 }
    };

    // Calculate discounted price
    const getDiscountedPrice = () => {
        if (!discount) return price;
        
        const discountedPrice = discount.discountType === 'percentage'
            ? price * (1 - discount.discountValue / 100)
            : price - discount.discountValue;
            
        return Math.max(0, Math.round(discountedPrice * 100) / 100);
    };

    const handleQuickAction = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isDisabled) {
            onSizeError?.();
            return;
        }

        // Get latest available size data
        const currentQuantity = cartItems[id]?.[selectedSize] || 0;
        const sizeData = sizes.find(s => s.size === selectedSize);
        const availableQuantity = sizeData ? Math.max(0, sizeData.quantity - currentQuantity) : 0;

        if (!selectedSize || availableQuantity === 0) {
            onSizeError?.();
            return;
        }

        await addToCart(id, selectedSize);
        localStorage.setItem('lastSelectedSize', selectedSize);
    };

    return (
        <Link
            onClick={() => scrollTo(0, 0)}
            className={`group relative text-gray-700 cursor-pointer transform transition-all duration-300 ease-in-out ${
                isOutOfStock ? 'opacity-75' : ''
            }`}
            to={`/product/${id}`}
        >
            <div
                className='relative overflow-hidden rounded-2xl shadow-xl transition-all duration-500 ease-in-out transform group-hover:scale-105 group-hover:shadow-lg group-hover:ring-2 group-hover:ring-gray-300'
                style={{ perspective: '1200px' }}
            >
                <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                >
                    <img
                        className={`group-hover:scale-105 transition-all duration-300 ease-in-out ${
                            isOutOfStock ? 'grayscale' : 'group-hover:brightness-110'
                        }`}
                        src={image[0]}
                        alt={name}
                    />
                    <div className='shine absolute inset-0 bg-gradient-radial from-transparent via-silver to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

                    {isOutOfStock && (
                        <div className='absolute top-0 right-0 bg-red-500 text-white px-3 py-1 m-2 rounded-lg text-sm font-medium'>
                            Out of Stock
                        </div>
                    )}

                    {/* Discount Badge */}
                    <AnimatePresence>
                        {discount && (
                            <motion.div
                                className="absolute top-3 right-3 transform transition-all duration-300 origin-center group-hover:scale-40"
                                variants={discountBadgeVariants}
                                initial="initial"
                                animate="animate"
                            >
                                <div className={`
                                    bg-red-500 text-white rounded-full p-3 shadow-lg 
                                    transform transition-transform duration-300
                                    group-hover:scale-[0.4] group-hover:rotate-12
                                `}>
                                    <span className="text-sm font-bold whitespace-nowrap">
                                        {discount.discountType === 'percentage' 
                                            ? `-${discount.discountValue}%`
                                            : `-${currency}${discount.discountValue}`
                                        }
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Product Title - Hidden on Hover */}
            <div className='pt-4 pb-2 group-hover:opacity-0 transition-opacity duration-300'>
                <p className='text-sm font-medium text-gray-800'>
                    {name}
                </p>
                <div className="flex items-center gap-2">
                    {discount ? (
                        <>
                            <motion.p 
                                className="text-lg font-semibold text-red-600"
                                variants={priceVariants}
                                initial="initial"
                                animate="animate"
                            >
                                {currency}{getDiscountedPrice()}
                            </motion.p>
                            <motion.p 
                                className="text-sm text-gray-500 line-through"
                                variants={priceVariants}
                                initial="initial"
                                animate="animate"
                            >
                                {currency}{price}
                            </motion.p>
                        </>
                    ) : (
                        <p className='text-lg font-semibold text-gray-900'>
                            {currency}{price}
                        </p>
                    )}
                </div>
            </div>

            {showSizeUI && (
                <div className='absolute bottom-0 left-0 right-0 text-center pb-4'>
                    <div className='opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm bg-white/90 p-4 rounded-lg mx-2 shadow-lg transform translate-y-2 group-hover:translate-y-0'>
                        {/* Size Selection Message */}
                        {!selectedSize && (
                            <motion.p 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm font-medium text-gray-800 mb-3 flex items-center justify-center gap-2"
                            >
                                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"/>
                                Please select a size
                            </motion.p>
                        )}
                        
                        {/* Size Buttons Grid */}
                        <div className='grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3'>
                            {validSizes.map((sizeData) => (
                                <motion.button
                                    key={sizeData.size}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSizeSelect(sizeData);
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`
                                        px-3 py-2 text-sm rounded-lg font-medium
                                        transition-all duration-300 ease-in-out
                                        ${sizeData.quantity === 0 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : selectedSize === sizeData.size
                                                ? 'bg-[#00BFAE] text-white shadow-lg ring-2 ring-[#00BFAE]/20'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }
                                    `}
                                >
                                    <span className="block">{sizeData.size}</span>
                                    <span className="text-xs opacity-75">({sizeData.quantity})</span>
                                </motion.button>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        {selectedSize && (
                            <>
                                {quantityLeft === 0 ? (
                                    <motion.button 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        disabled
                                        className='w-full py-2.5 bg-red-500 text-white font-semibold rounded-lg opacity-75 cursor-not-allowed flex items-center justify-center gap-2'
                                    >
                                        <span className="animate-pulse">⚠️</span>
                                        OUT OF STOCK
                                    </motion.button>
                                ) : (
                                    <div className="space-y-2">
                                        <motion.button
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleAddToCart}
                                            className='w-full py-2.5 bg-[#00BFAE] text-white font-semibold rounded-lg hover:bg-[#00A38B] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2'
                                        >
                                            <span className="animate-bounce">🛒</span>
                                            ADD TO CART
                                        </motion.button>
                                        <motion.button
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleBuyNow}
                                            className='w-full py-2.5 bg-[#A17DFF] text-white font-semibold rounded-lg hover:bg-[#8B64E5] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2'
                                        >
                                            <span className="animate-bounce">🚀</span>
                                            BUY NOW
                                        </motion.button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {!showSizeUI && (
                <div className='absolute bottom-0 left-0 right-0 text-center pb-4'>
                    <div className='opacity-0 group-hover:opacity-100 transition-all duration-500'>
                        <motion.button
                            onClick={handleQuickAction}
                            disabled={isDisabled}
                            className={`
                                w-full py-2.5 font-semibold rounded-lg transition-all duration-300 shadow-lg 
                                flex items-center justify-center gap-2
                                ${isDisabled 
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-[#00BFAE] text-white hover:bg-[#00A38B] hover:shadow-xl'
                                }
                            `}
                            whileHover={!isDisabled && { scale: 1.02 }}
                            whileTap={!isDisabled && { scale: 0.98 }}
                        >
                            {isDisabled ? (
                                <>
                                    <span className="animate-pulse">⚠️</span>
                                    OUT OF STOCK
                                </>
                            ) : (
                                <>
                                    <span className="animate-bounce">🛒</span> 
                                    Quick Add
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            )}
        </Link>
    );
};

export default ProductItem;
