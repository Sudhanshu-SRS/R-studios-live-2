import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const RelatedProducts = ({category, subCategory}) => {
    const { products, cartItems } = useContext(ShopContext);
    const [related, setRelated] = useState([]);
    const [lastSelectedSize, setLastSelectedSize] = useState(null);

    // Listen for changes in localStorage
    useEffect(() => {
        setLastSelectedSize(localStorage.getItem('lastSelectedSize'));

        const handleStorageChange = (e) => {
            if (e.key === 'lastSelectedSize') {
                setLastSelectedSize(e.newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('sizeChanged', (e) => {
            setLastSelectedSize(e.detail.size);
        });

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('sizeChanged', handleStorageChange);
        };
    }, []);

    // Enhanced findAvailableSize function with stock checking
    const findAvailableSize = (product) => {
        // Get available sizes after considering cart quantities
        const availableSizes = product.sizes.map(size => ({
            ...size,
            availableQuantity: Math.max(0, size.quantity - (cartItems[product._id]?.[size.size] || 0))
        }));

        // Check if any size is in stock
        const hasAnyStock = availableSizes.some(s => s.availableQuantity > 0);

        if (!hasAnyStock) {
            return null;
        }

        // Try to find the last selected size with stock
        if (lastSelectedSize) {
            const sizeData = availableSizes.find(s => 
                s.size === lastSelectedSize && s.availableQuantity > 0
            );
            if (sizeData) return lastSelectedSize;
        }

        // If last size is not available, find first available size
        const availableSize = availableSizes.find(s => s.availableQuantity > 0);
        return availableSize?.size;
    };

    const handleQuickAction = async (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        // Get latest available size data
        const updatedSizes = sizes.map(size => ({
            ...size,
            quantity: Math.max(0, size.quantity - (cartItems[id]?.[size.size] || 0))
        }));
    
        // First try to use the default size if it's available
        if (defaultSize) {
            const defaultSizeData = updatedSizes.find(s => 
                s.size === defaultSize && s.quantity > 0
            );
            if (defaultSizeData) {
                setSelectedSize(defaultSize);
                setQuantityLeft(defaultSizeData.quantity);
                await addToCart(id, defaultSize);
                localStorage.setItem('lastSelectedSize', defaultSize);
                window.dispatchEvent(new CustomEvent('sizeChanged', {
                    detail: { size: defaultSize }
                }));
                return;
            }
        }
    
        // If default size is not available, find first available size
        const availableSize = updatedSizes.find(s => s.quantity > 0);
        if (availableSize) {
            setSelectedSize(availableSize.size);
            setQuantityLeft(availableSize.quantity);
            await addToCart(id, availableSize.size);
            localStorage.setItem('lastSelectedSize', availableSize.size);
            window.dispatchEvent(new CustomEvent('sizeChanged', {
                detail: { size: availableSize.size }
            }));
        } else {
            onSizeError?.();
        }
    };

    useEffect(() => {
        if (products.length > 0) {
            let productsCopy = products.slice();
            productsCopy = productsCopy.filter((item) => 
                category === item.category && subCategory === item.subCategory
            );
            setRelated(productsCopy.slice(0, 4));
        }
    }, [products, category, subCategory]);

    if (related.length === 0) return null;

    return (
        <motion.div 
            className='py-16 px-4 sm:px-6 lg:px-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className='text-center mb-8'>
                <Title text1={'RELATED'} text2={'PRODUCTS'} />
                <p className="mt-2 text-sm text-gray-600">
                    You might also like these items
                </p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12'>
                {related.map((item, index) => {
                    const availableSize = findAvailableSize(item);
                    const isOutOfStock = !availableSize;

                    return (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative min-h-[400px]"
                        >
                            <ProductItem 
                                id={item._id} 
                                name={item.name} 
                                price={item.price}
                                image={item.image}
                                sizes={item.sizes}
                                discount={item.discount}
                                defaultSize={availableSize}
                                showSizeUI={false}
                                onSizeError={() => {
                                    toast.error('This Size Of item is currently out of stock');
                                }}
                                isDisabled={isOutOfStock}
                            />
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default RelatedProducts;
