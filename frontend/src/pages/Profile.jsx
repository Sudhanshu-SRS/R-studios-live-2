import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Title from '../components/Title';
import PopupVerify from '../components/PopupVerify';

const Profile = () => {
    const { 
        backendUrl, 
        token, 
        setToken, 
        userData,
        setUserData,  // Add this line
        isVerified,
        showVerifyPopup,
        setShowVerifyPopup 
    } = useContext(ShopContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    

    // Add request interceptor
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

    // Add debug logging
    useEffect(() => {
        console.log('Current userData:', userData);
        console.log('Loading state:', isLoading);
    }, [userData, isLoading]);

    useEffect(() => {
        if (token) {
            fetchUserProfile();
        } else {
            navigate('/login');
        }
    }, [token]);

    // Add profile render UI
    return (
        <div className="container mx-auto px-4 py-8">
            <Title title="Profile" />
            
            {/* Show verification popup for unverified users */}
            {showVerifyPopup && !isVerified && (
                <PopupVerify onClose={() => setShowVerifyPopup(false)} />
            )}
            
            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg p-6">
                    {userData?.name ? (
                        <>
                            <h2 className="text-2xl font-bold mb-4">{userData.name}</h2>
                            <div className="space-y-4">
                                <p><span className="font-semibold">Email:</span> {userData.email}</p>
                                <p><span className="font-semibold">Phone:</span> {userData.phone || 'Not provided'}</p>
                                {userData.address && Object.keys(userData.address).length > 0 ? (
                                    <div className="mt-4">
                                        <h3 className="text-xl font-semibold mb-2">Address</h3>
                                        <p>{userData.address.street}</p>
                                        <p>{userData.address.city}, {userData.address.state}</p>
                                        <p>{userData.address.zipcode}</p>
                                        <p>{userData.address.country}</p>
                                    </div>
                                ) : (
                                    <p>No address information available</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-gray-500">No profile data available</p>
                    )}
                </div>
            )}
        </div>
    );

    // ... rest of your component code
};

export default Profile;