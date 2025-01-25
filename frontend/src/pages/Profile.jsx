import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Title from '../components/Title';
import PopupVerify from '../components/PopupVerify';
import { motion } from 'framer-motion'; // Import framer-motion

const Profile = () => {
    const { 
        backendUrl, 
        token, 
        setToken, 
        userData,
        setUserData,
        isVerified,
        showVerifyPopup,
        setShowVerifyPopup 
    } = useContext(ShopContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [address, setAddress] = useState({
        firstName: '',
        lastName: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: ''
    });

    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            config => {
                const storedToken = token || localStorage.getItem('token');
                if (storedToken) {
                    config.headers.Authorization = `Bearer ${storedToken}`;
                }
                return config;
            },
            error => {
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
        };
    }, [token]);

    const fetchUserProfile = async () => {
        try {
            setIsLoading(true);
            const storedToken = token || localStorage.getItem('token');
            
            if (!storedToken) {
                toast.error('Please login to continue');
                navigate('/login');
                return;
            }
    
            const response = await axios.get(
                `${backendUrl}/api/user/profile`,
                {
                    headers: {
                        'Authorization': `Bearer ${storedToken}`
                    },
                    withCredentials: true
                }
            );
            
            if (response.data.success) {
                setUserData(response.data.user);
            } else {
                toast.error(response.data.message || 'Failed to fetch profile data');
            }
        } catch (error) {
            console.error("Profile fetch error:", error);
            if (error?.response?.status === 401) {
                localStorage.removeItem('token');
                setToken(null);
                navigate('/login');
            } else {
                toast.error(error?.response?.data?.message || 'Error fetching profile');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUserProfile();
        } else {
            navigate('/login');
        }
    }, [token]);

    useEffect(() => {
        if (userData?.address) {
            setAddress(userData.address);
        }
    }, [userData]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(
                `${backendUrl}/api/user/profile/update`,
                {
                    userId: userData?._id,
                    address
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setUserData(response.data.user);
                setIsEditing(false);
                toast.success('Profile updated successfully');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update profile');
        }
    };

    const cardAnimation = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Title text1="MY" text2="PROFILE" />
            {showVerifyPopup && !isVerified && (
                <PopupVerify onClose={() => setShowVerifyPopup(false)} />
            )}
            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <motion.div 
                        className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    ></motion.div>
                </div>
            ) : (
                <motion.div 
                    className="bg-white shadow rounded-lg p-6"
                    variants={cardAnimation}
                    initial="hidden"
                    animate="visible"
                >
                    {!isEditing ? (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-4">User Information</h2>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Name:</span> {userData?.name}</p>
                                    <p><span className="font-medium">Email:</span> {userData?.email}</p>
                                    <p><span className="font-medium">Account Status:</span> 
                                        {userData?.isAccountVerified ? 
                                            <span className="text-green-600"> Verified</span> : 
                                            <span className="text-red-600"> Not Verified</span>
                                        }
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
                                {userData?.address ? (
                                    <div className="space-y-2">
                                        <p>{userData.address.firstName} {userData.address.lastName}</p>
                                        <p>{userData.address.street}</p>
                                        <p>{userData.address.city}, {userData.address.state}</p>
                                        <p>{userData.address.zipcode}, {userData.address.country}</p>
                                        <p><span className="font-medium">Phone:</span> {userData.address.phone}</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No delivery address saved</p>
                                )}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsEditing(true)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors"
                            >
                                {userData?.address ? 'Edit Information' : 'Add Address'}
                            </motion.button>
                        </div>
                    ) : (
                        <motion.form 
                            onSubmit={handleUpdateProfile} 
                            className="space-y-4"
                            variants={cardAnimation}
                            initial="hidden"
                            animate="visible"
                        >
                            <h2 className="text-xl font-semibold mb-4">Edit Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={address.firstName}
                                    onChange={(e) => setAddress({...address, firstName: e.target.value})}
                                    className="border rounded p-2"
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={address.lastName}
                                    onChange={(e) => setAddress({...address, lastName: e.target.value})}
                                    className="border rounded p-2"
                                />
                                <input
                                    type="text"
                                    placeholder="Street Address"
                                    value={address.street}
                                    onChange={(e) => setAddress({...address, street: e.target.value})}
                                    className="border rounded p-2 md:col-span-2"
                                />
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={address.city}
                                    onChange={(e) => setAddress({...address, city: e.target.value})}
                                    className="border rounded p-2"
                                />
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={address.state}
                                    onChange={(e) => setAddress({...address, state: e.target.value})}
                                    className="border rounded p-2"
                                />
                                <input
                                    type="text"
                                    placeholder="Postal Code"
                                    value={address.zipcode}
                                    onChange={(e) => setAddress({...address, zipcode: e.target.value})}
                                    className="border rounded p-2"
                                />
                                <input
                                    type="text"
                                    placeholder="Country"
                                    value={address.country}
                                    onChange={(e) => setAddress({...address, country: e.target.value})}
                                    className="border rounded p-2"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={address.phone}
                                    onChange={(e) => setAddress({...address, phone: e.target.value})}
                                    className="border rounded p-2"
                                />
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors"
                                >
                                    Save Changes
                                </motion.button>
                            </div>
                        </motion.form>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default Profile;
