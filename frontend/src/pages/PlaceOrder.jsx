import React, { useContext, useState, useEffect } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom';
const PlaceOrder = () => {
    const [method, setMethod] = useState('cod');
    const [useSavedAddress, setUseSavedAddress] = useState(true);
    const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products, userData } = useContext(ShopContext);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: ''
    });
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptPolicies, setAcceptPolicies] = useState(false);
    const [isAddressValid, setIsAddressValid] = useState(false);

    // Check address validity whenever userData or formData changes
    useEffect(() => {
        if (userData?.address && useSavedAddress) {
            // Check if saved address has all required fields
            const savedAddress = userData.address;
            const isValid = savedAddress.firstName && 
                           savedAddress.lastName && 
                           savedAddress.street && 
                           savedAddress.city && 
                           savedAddress.state && 
                           savedAddress.zipcode && 
                           savedAddress.country && 
                           savedAddress.phone;
            setIsAddressValid(isValid);
        } else if (!useSavedAddress && formData.street) {
            // Check if new address form has all required fields
            const isValid = formData.firstName && 
                           formData.lastName && 
                           formData.email && 
                           formData.street && 
                           formData.city && 
                           formData.state && 
                           formData.zipcode && 
                           formData.country && 
                           formData.phone;
            setIsAddressValid(isValid);
        } else {
            setIsAddressValid(false);
        }
    }, [userData, formData, useSavedAddress]);

    // Set initial address state based on user data
    useEffect(() => {
        if (!userData?.address) {
            setUseSavedAddress(false);
            setIsAddressValid(false);
        }
    }, [userData]);

    // Update form data when switching between saved and new address
    useEffect(() => {
        if (userData?.address && useSavedAddress) {
            setFormData({
                firstName: userData.address.firstName || '',
                lastName: userData.address.lastName || '',
                email: userData.email || '',
                street: userData.address.street || '',
                city: userData.address.city || '',
                state: userData.address.state || '',
                zipcode: userData.address.zipcode || '',
                country: userData.address.country || '',
                phone: userData.address.phone || ''
            });
        } else if (!useSavedAddress) {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                street: '',
                city: '',
                state: '',
                zipcode: '',
                country: '',
                phone: ''
            });
        }
    }, [userData, useSavedAddress]);

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setFormData(data => ({ ...data, [name]: value }))
    }

    const initPay = (order) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'R-Studio Order',
            description: 'Order Payment',
            order_id: order.id,
            receipt: order.receipt,
            handler: async function (response) {
                try {
                    const verifyResponse = await axios.post(
                        `${backendUrl}/api/order/verifyRazorpay`,
                        {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            userId: userData?._id
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            withCredentials: true
                        }
                    );

                    if (verifyResponse.data.success) {
                        setCartItems({});
                        toast.success('Payment successful');
                        navigate('/orders');
                    } else {
                        toast.error('Payment verification failed');
                        navigate('/cart');
                    }
                } catch (error) {
                    console.error('Payment verification error:', error);
                    toast.error(error?.response?.data?.message || 'Payment verification failed');
                    navigate('/cart');
                }
            },
            prefill: {
                name: `${userData?.firstName} ${userData?.lastName}`,
                email: userData?.email,
                contact: userData?.phone
            },
            theme: {
                color: '#00BFAE'
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    const handlePaymentMethodSelect = (selectedMethod) => {
        if (!isAddressValid) {
            toast.error('Please provide a complete delivery address');
            return;
        }
        setMethod(selectedMethod);
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (!isAddressValid) {
            toast.error('Please provide a complete delivery address');
            return;
        }

        if (!acceptTerms || !acceptPolicies) {
            toast.error('Please accept the terms and policies');
            return;
        }

        // Add payment method validation
        if (!method) {
            toast.error('Please select a payment method');
            return;
        }

        try {
            const storedToken = token || localStorage.getItem('token');
            
            if (!storedToken) {
                toast.error('Please login to place order');
                navigate('/login');
                return;
            }

            // If it's a new address, save it to user profile first
            if (!useSavedAddress && formData.street) {
                try {
                    const response = await axios.put(
                        `${backendUrl}/api/user/profile/update`,
                        {
                            userId: userData?._id,
                            address: formData
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${storedToken}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (response.data.success) {
                        await getUserData(); // Refresh user data with new address
                    }
                } catch (error) {
                    console.error('Error saving address:', error);
                    toast.error('Failed to save address');
                    return;
                }
            }

            let orderItems = [];
            for (const items in cartItems) {
                for (const size in cartItems[items]) {
                    const product = products.find(p => p._id === items);
                    if (product && cartItems[items][size] > 0) {
                        orderItems.push({
                            _id: product._id,
                            name: product.name,
                            image: product.image,
                            price: product.price,
                            size: size,
                            quantity: cartItems[items][size]
                        });
                    }
                }
            }

            let orderData = {
                userId: userData?._id,
                items: orderItems,
                amount: getCartAmount() + delivery_fee,
                address: formData
            };

            const headers = {
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json'
            };

            switch (method) {
                case 'cod':
                    const response = await axios.post(
                        `${backendUrl}/api/order/place`, 
                        orderData,
                        { headers, withCredentials: true }
                    );
                    if (response.data.success) {
                        setCartItems({});
                        toast.success('Order placed successfully');
                        navigate('/orders');
                    }
                    break;

                case 'stripe':
                    const responseStripe = await axios.post(
                        `${backendUrl}/api/order/stripe`,
                        orderData,
                        { headers, withCredentials: true }
                    );
                    if (responseStripe.data.success) {
                        window.location.replace(responseStripe.data.session_url);
                    }
                    break;

                case 'razorpay':
                    const responseRazorpay = await axios.post(
                        `${backendUrl}/api/order/razorpay`,
                        orderData,
                        { headers, withCredentials: true }
                    );
                    if (responseRazorpay.data.success) {
                        initPay(responseRazorpay.data.order);
                    }
                    break;
            }
        } catch (error) {
            if (error?.response?.status === 401) {
                localStorage.removeItem('token');
                setToken(null);
                toast.error('Session expired. Please login again');
                navigate('/login');
            } else {
                toast.error(error?.response?.data?.message || 'Failed to place order');
            }
            console.error("Order placement error:", error);
        }
    };


    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
            {/* ------------- Left Side ---------------- */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>

                <div className='text-xl sm:text-2xl my-3'>
                    <Title text1={'DELIVERY'} text2={'INFORMATION'} />
                </div>

                {/* Address Selection */}
                {userData?.address && (
                    <div className="mb-4 p-4 border rounded-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Delivery Address</h3>
                            <div className="flex gap-2">
                                {useSavedAddress ? (
                                    <button
                                        type="button"
                                        onClick={() => setUseSavedAddress(false)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors"
                                    >
                                        Add New Address
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setUseSavedAddress(true)}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
                                    >
                                        Use Saved Address
                                    </button>
                                )}
                            </div>
                        </div>

                        {useSavedAddress && (
                            <div className="text-sm text-gray-600 border-l-4 border-blue-500 pl-4">
                                <p className="font-medium">{userData.address.firstName} {userData.address.lastName}</p>
                                <p>{userData.address.street}</p>
                                <p>{userData.address.city}, {userData.address.state}</p>
                                <p>{userData.address.zipcode}, {userData.address.country}</p>
                                <p>Phone: {userData.address.phone}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Address Form - Show if no saved address or adding new address */}
                {(!userData?.address || !useSavedAddress) && (
                    <div className="space-y-4">
                        <h3 className="font-semibold">Enter New Address</h3>
                        <div className='flex gap-3'>
                            <input 
                                required 
                                onChange={onChangeHandler} 
                                name='firstName' 
                                value={formData.firstName} 
                                className='border border-gray-300 rounded py-1.5 px-3.5 w-full' 
                                type="text" 
                                placeholder='First name'
                                disabled={useSavedAddress}
                            />
                            <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Last name' />
                        </div>
                        <input required onChange={onChangeHandler} name='email' value={formData.email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="email" placeholder='Email address' />
                        <input required onChange={onChangeHandler} name='street' value={formData.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Street' />
                        <div className='flex gap-3'>
                            <input required onChange={onChangeHandler} name='city' value={formData.city} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='City' />
                            <input onChange={onChangeHandler} name='state' value={formData.state} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='State' />
                        </div>
                        <div className='flex gap-3'>
                            <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Zipcode' />
                            <input required onChange={onChangeHandler} name='country' value={formData.country} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Country' />
                        </div>
                        <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Phone' />
                    </div>
                )}
            </div>

            {/* ------------- Right Side ------------------ */}
            <div className='mt-8'>
                <div className='mt-8 min-w-80'>
                    <CartTotal />
                </div>

                <div className='mt-12'>
                    <Title text1={'PAYMENT'} text2={'METHOD'} />
                    
                    {/* Address warning message */}
                    {!isAddressValid && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-700 text-sm flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Please select or add a delivery address before choosing payment method
                            </p>
                        </div>
                    )}

                    {/* --------------- Payment Method Selection ------------- */}
                    <div className='space-y-6'>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                            {/* Stripe Payment Option */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handlePaymentMethodSelect('stripe')}
                                className={`
                                    flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                                    ${!isAddressValid ? 'opacity-50 cursor-not-allowed' : ''}
                                    ${method === 'stripe' 
                                        ? 'border-green-500 bg-green-50 shadow-lg' 
                                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                    }
                                `}
                            >
                                <div className={`
                                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                                    ${method === 'stripe' ? 'border-green-500' : 'border-gray-300'}
                                `}>
                                    {method === 'stripe' && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-3 h-3 bg-green-500 rounded-full"
                                        />
                                    )}
                                </div>
                                <img className='h-6' src={assets.stripe_logo} alt="Stripe" />
                            </motion.div>

                            {/* Razorpay Payment Option */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handlePaymentMethodSelect('razorpay')}
                                className={`
                                    flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                                    ${!isAddressValid ? 'opacity-50 cursor-not-allowed' : ''}
                                    ${method === 'razorpay' 
                                        ? 'border-green-500 bg-green-50 shadow-lg' 
                                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                    }
                                `}
                            >
                                <div className={`
                                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                                    ${method === 'razorpay' ? 'border-green-500' : 'border-gray-300'}
                                `}>
                                    {method === 'razorpay' && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-3 h-3 bg-green-500 rounded-full"
                                        />
                                    )}
                                </div>
                                <img className='h-6' src={assets.razorpay_logo} alt="Razorpay" />
                            </motion.div>

                            {/* COD Payment Option */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handlePaymentMethodSelect('cod')}
                                className={`
                                    flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                                    ${!isAddressValid ? 'opacity-50 cursor-not-allowed' : ''}
                                    ${method === 'cod' 
                                        ? 'border-green-500 bg-green-50 shadow-lg' 
                                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                    }
                                `}
                            >
                                <div className={`
                                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                                    ${method === 'cod' ? 'border-green-500' : 'border-gray-300'}
                                `}>
                                    {method === 'cod' && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-3 h-3 bg-green-500 rounded-full"
                                        />
                                    )}
                                </div>
                                <span className='text-gray-700 font-medium'>Cash On Delivery</span>
                            </motion.div>
                        </div>

                        <div className="space-y-4 mt-8 mb-4">
                            <div className="flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={acceptTerms}
                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                    className="mt-1.5"
                                    required
                                />
                                <label htmlFor="terms" className="text-sm text-gray-600">
                                    I accept the{' '}
                                    <Link to="/terms" target="_blank" className="text-blue-500 hover:underline">
                                        Terms and Conditions
                                    </Link>
                                </label>
                            </div>
                            
                            <div className="flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    id="policies"
                                    checked={acceptPolicies}
                                    onChange={(e) => setAcceptPolicies(e.target.checked)}
                                    className="mt-1.5"
                                    required
                                />
                                <label htmlFor="policies" className="text-sm text-gray-600">
                                    I accept the{' '}
                                    <Link to="/return" target="_blank" className="text-blue-500 hover:underline">
                                        Return & Refund
                                    </Link>,{' '}
                                    <Link to="/shipping" target="_blank" className="text-blue-500 hover:underline">
                                        Shipping
                                    </Link>{' '}
                                    and{' '}
                                    <Link to="/exchange" target="_blank" className="text-blue-500 hover:underline">
                                        Exchange
                                    </Link>{' '}
                                    policies
                                </label>
                            </div>
                        </div>

                        <div className='w-full flex justify-end mt-8'>
                            <motion.button
                                type='submit'
                                disabled={!acceptTerms || !acceptPolicies}
                                whileHover={{ scale: !acceptTerms || !acceptPolicies ? 1 : 1.02 }}
                                whileTap={{ scale: !acceptTerms || !acceptPolicies ? 1 : 0.98 }}
                                className={`
                                    px-6 py-2 rounded-lg font-medium 
                                    flex items-center justify-center gap-2 transition-all duration-300
                                    ${(!acceptTerms || !acceptPolicies)
                                        ? 'bg-gray-400 cursor-not-allowed opacity-50'
                                        : 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl'
                                    }
                                `}
                            >
                                <span>Place Order</span>
                                <motion.span 
                                    initial={{ x: 0 }}
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    →
                                </motion.span>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default PlaceOrder
