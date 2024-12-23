import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Title from '../components/Title';

const Profile = () => {
    const { backendUrl, token } = useContext(ShopContext);
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipcode: '',
            country: ''
        }
    });

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(
                `${backendUrl}/api/user/profile`,
                { headers: { token } }
            );
            if (response.data.success) {
                setUserData(response.data.user);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('Failed to fetch profile');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(
                `${backendUrl}/api/user/profile/update`,
                userData,
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success('Profile updated successfully');
                setIsEditing(false);
            }
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [token]);

    return (
        <div className="max-w-2xl mx-auto py-8">
            <Title text1="MY" text2="PROFILE" />
            
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            value={userData.name}
                            onChange={(e) => setUserData({...userData, name: e.target.value})}
                            disabled={!isEditing}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={userData.email}
                            disabled
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                            type="text"
                            value={userData.phone}
                            onChange={(e) => setUserData({...userData, phone: e.target.value})}
                            disabled={!isEditing}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                        />
                    </div>

                    {isEditing ? (
                        <div className="space-y-4">
                            <h3 className="font-medium">Address</h3>
                            <input
                                type="text"
                                placeholder="Street"
                                value={userData.address?.street || ''}
                                onChange={(e) => setUserData({
                                    ...userData,
                                    address: {...userData.address, street: e.target.value}
                                })}
                                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={userData.address?.city || ''}
                                    onChange={(e) => setUserData({
                                        ...userData,
                                        address: {...userData.address, city: e.target.value}
                                    })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                                />
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={userData.address?.state || ''}
                                    onChange={(e) => setUserData({
                                        ...userData,
                                        address: {...userData.address, state: e.target.value}
                                    })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                                />
                                <input
                                    type="text"
                                    placeholder="Zipcode"
                                    value={userData.address?.zipcode || ''}
                                    onChange={(e) => setUserData({
                                        ...userData,
                                        address: {...userData.address, zipcode: e.target.value}
                                    })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                                />
                                <input
                                    type="text"
                                    placeholder="Country"
                                    value={userData.address?.country || ''}
                                    onChange={(e) => setUserData({
                                        ...userData,
                                        address: {...userData.address, country: e.target.value}
                                    })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <h3 className="font-medium">Address</h3>
                            <p className="text-gray-600">
                                {userData.address?.street}<br />
                                {userData.address?.city}, {userData.address?.state}<br />
                                {userData.address?.zipcode}, {userData.address?.country}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4">
                    {isEditing ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 border rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                            >
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default Profile;