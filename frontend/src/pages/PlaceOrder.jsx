import React, { useContext, useState, useEffect } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

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

    // Load saved address when component mounts or when useSavedAddress changes
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
            // Clear form if user chooses to add new address
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
            name: 'Order Payment',
            description: 'Order Payment',
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                // console.log('Razorpay Response:', response);
                try {
                    const verifyResponse = await axios.post(
                        `${backendUrl}/api/order/verifyRazorpay`,
                        {
                            ...response,
                            userId: userData?._id,
                            orderId: response.razorpay_order_id
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
                    // console.error('Payment verification error:', error);
                    if (error?.response?.status === 401) {
                        localStorage.removeItem('token');
                        setToken(null);
                        toast.error('Session expired. Please login again');
                        navigate('/login');
                    } else {
                        toast.error('Payment verification failed');
                        navigate('/cart');
                    }
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            const storedToken = token || localStorage.getItem('token');
            
            if (!storedToken) {
                toast.error('Please login to place order');
                navigate('/login');
                return;
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
                    {/* --------------- Payment Method Selection ------------- */}
                    <div className='flex gap-3 flex-col lg:flex-row'>
                        <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.stripe_logo} alt="" />
                        </div>
                        <div onClick={() => setMethod('razorpay')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.razorpay_logo} alt="" />
                        </div>
                        <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                            <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
                        </div>
                    </div>

                    <div className='w-full text-end mt-8'>
                        <button type='submit' className='bg-black text-white px-16 py-3 text-sm'>PLACE ORDER</button>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default PlaceOrder
