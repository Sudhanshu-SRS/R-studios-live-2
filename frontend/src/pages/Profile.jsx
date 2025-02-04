import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";
import PopupVerify from "../components/PopupVerify";
import { motion } from "framer-motion";

export default function Profile() {
  const {
    backendUrl,
    token,
    setToken,
    userData,
    setUserData,
    isVerified,
    showVerifyPopup,
    setShowVerifyPopup,
  } = useContext(ShopContext);

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    street: "",
    addressLine2: "", 
    landmark: "", 
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });
  const [phone, setPhone] = useState("");
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const storedToken = token || localStorage.getItem("token");
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const storedToken = token || localStorage.getItem("token");

      if (!storedToken) {
        toast.error("Please login to continue");
        navigate("/login");
        return;
      }

      const response = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        setUserData(response.data.user);
      } else {
        toast.error(response.data.message || "Failed to fetch profile data");
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        setToken(null);
        navigate("/login");
      } else {
        toast.error("Error fetching profile");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      navigate("/login");
    }
  }, [token]);

  useEffect(() => {
    if (userData?.address) {
      setAddress(userData.address);
    }
    if (userData?.phone) {
      setPhone(userData.phone);
    }
  }, [userData]);

  const handleAddPhoneNumber = async (e) => {
    e.preventDefault();

    if (!phone.match(/^[0-9]{10}$/)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      const response = await axios.put(
        `${backendUrl}/api/user/profile/update`,
        { phone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Phone number added successfully");
        setUserData(response.data.user);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to add phone number");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${backendUrl}/api/user/profile/update`,
        {
          userId: userData?._id,
          address,
          phone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setUserData(response.data.user);
        setIsEditing(false);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };
  const validatePincode = (pincode) => {
    // Must be 6 digits and start with a valid first digit (1-9)
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(pincode)) {
      return false;
    }
  
    // Check for invalid pin codes (e.g., 111111, 999999)
    const invalidPincodes = ['111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999'];
    if (invalidPincodes.includes(pincode)) {
      return false;
    }
  
    return true;
  };
  
  const fetchLocationFromZipcode = async (zipcode) => {
    // Clear previous location data if pincode is incomplete
    if (zipcode.length < 6) {
      setAddress(prev => ({
        ...prev,
        city: '',
        state: ''
      }));
      return;
    }
  
    if (zipcode.length === 6) {
      // Validate pincode format
      if (!validatePincode(zipcode)) {
        toast.error("Please enter a valid Indian pincode");
        setAddress(prev => ({
          ...prev,
          city: '',
          state: ''
        }));
        return;
      }
  
      setIsFetchingLocation(true);
      try {
        const response = await axios.get(
          `${backendUrl}/api/user/pincode/${zipcode}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data[0]?.Status === "Success" && response.data[0]?.PostOffice?.length > 0) {
          const locationData = response.data[0].PostOffice[0];
          setAddress(prev => ({
            ...prev,
            city: locationData.Block || locationData.District,
            state: locationData.State,
            country: "India" // Auto-set country for Indian pincodes
          }));
        } else {
          toast.error("No location found for this pincode");
          setAddress(prev => ({
            ...prev,
            city: '',
            state: ''
          }));
        }
      } catch (error) {
        console.error("Error fetching location:", error);
        toast.error("Failed to fetch location data");
        setAddress(prev => ({
          ...prev,
          city: '',
          state: ''
        }));
      } finally {
        setIsFetchingLocation(false);
      }
    }
  };

  const cardAnimation = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
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
            className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : (
        <motion.div
          className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 backdrop-blur-sm"
          variants={cardAnimation}
          initial="hidden"
          animate="visible"
        >
      {/* Phone Number Section (Always Visible) */}
{/* Phone Number Section */}
<div className="space-y-6 mb-10">
  {userData?.phone ? (
    // Show only current phone number in green box if exists
    <div className="flex items-center gap-2">
      <span className="text-teal-500">📱</span>
      <span className="text-sm bg-teal-50 text-teal-600 px-4 py-2 rounded-full font-medium">
        {userData.phone}
      </span>
      <span className="text-sm text-gray-500">(WhatsApp updates enabled)</span>
    </div>
  ) : (
    // Show add phone number section if no phone number exists
    <motion.div
      className="p-8 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl shadow-lg"
      variants={cardAnimation}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Add Your Phone Number to Receive WhatsApp Updates 📱
      </h2>
      <h3 className="text-lg font-semibold text-yellow-900 mb-3">
        Add Phone Number 📞
      </h3>
      <p className="text-sm text-yellow-800 mb-4">
        Please provide a valid Indian phone number to stay updated with exclusive offers and order updates on WhatsApp.
      </p>

      <form onSubmit={handleAddPhoneNumber} className="space-y-5">
        {/* Phone Number Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            pattern="[6-9][0-9]{9}"
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4
                     text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 
                     transition"
            placeholder="Enter your 10-digit Indian phone number"
          />
          {phone && !/^[6-9][0-9]{9}$/.test(phone) && (
            <p className="text-red-600 text-sm mt-1">
              Please enter a valid 10-digit Indian phone number starting with 6-9.
            </p>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#0d9488" }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="w-full py-3 px-4 bg-teal-600 text-white font-semibold rounded-lg shadow-md 
                   hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 
                   transition-all duration-300"
        >
          Add Phone Number
        </motion.button>
      </form>
    </motion.div>
  )}
</div>



          {/* User Information & Address */}
          {!isEditing ? (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
                  <span className="p-2 bg-teal-50 rounded-lg">👤</span>
                  User Information
                </h2>
                <div className="grid gap-4 p-6 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm transition-all hover:shadow-md">
                    <span className="font-medium text-gray-600 min-w-[100px]">
                      Name:
                    </span>
                    <span className="text-gray-800">{userData?.name}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm transition-all hover:shadow-md">
                    <span className="font-medium text-gray-600 min-w-[100px]">
                      Email:
                    </span>
                    <span className="text-gray-800">{userData?.email}</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
                  <span className="p-2 bg-teal-50 rounded-lg">📍</span>
                  Delivery Address
                </h2>
                {userData?.address ? (
                  <motion.div
                    className="space-y-3 p-6 bg-gray-50 rounded-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-teal-500">👤</span>
                      <p className="font-medium">
                        {userData.address.firstName} {userData.address.lastName}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-teal-500">🏠</span>
                      <p>{userData.address.street}</p>
                    </div>
                    {/* Only show Address Line 2 if it exists */}
{userData.address.addressLine2 && (
  <div className="space-y-2 md:col-span-2">
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
      <span className="text-teal-500">🏢</span>
      <p>{userData.address.addressLine2}</p>
    </div>
  </div>
)}
                    {/* Only show Landmark if it exists */}
{userData.address.landmark && (
  <div className="space-y-2 md:col-span-2">
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
      <span className="text-teal-500">🎯</span>
      <p>{userData.address.landmark}</p>
    </div>
  </div>
)}
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-teal-500">🌆</span>
                      <p>
                        {userData.address.city}, {userData.address.state}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-teal-500">📮</span>
                      <p>
                        {userData.address.zipcode}, {userData.address.country}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-teal-500">📱</span>
                      <p>{userData.address.phone}</p>
                    </div>
                    

                   

                   
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <span className="text-4xl mb-3">📍</span>
                    <p className="text-gray-500 mb-4">No delivery address saved</p>
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors"
              >
                {userData?.address ? "Edit Information" : "Add Address"}
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
                  onChange={(e) =>
                    setAddress({ ...address, firstName: e.target.value })
                  }
                  className="border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={address.lastName}
                  onChange={(e) =>
                    setAddress({ ...address, lastName: e.target.value })
                  }
                  className="border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="Address Line "
                  value={address.street}
                  onChange={(e) =>
                    setAddress({ ...address, street: e.target.value })
                  }
                  className="border rounded p-2 md:col-span-2"
                />
                 <input
      type="text"
      placeholder="Address Line 2 (Optional)"
      value={address.addressLine2}
      onChange={(e) =>
        setAddress({ ...address, addressLine2: e.target.value })
      }
      className="border rounded p-2 md:col-span-2"
    />
    <input
      type="text"
      placeholder="Landmark (Optional)"
      value={address.landmark}
      onChange={(e) =>
        setAddress({ ...address, landmark: e.target.value })
      }
      className="border rounded p-2 md:col-span-2"
    />
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={address.zipcode}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAddress({ ...address, zipcode: value });
                      fetchLocationFromZipcode(value);
                    }}
                    className="border rounded p-2 w-full mb-2"
                    maxLength={6}
                  />
                  {isFetchingLocation && (
                    <p className="text-sm text-blue-500">Fetching location data...</p>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="City"
                  value={address.city}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  className="border rounded p-2"
                  disabled={isFetchingLocation}
                />
                <input
                  type="text"
                  placeholder="State"
                  value={address.state}
                  onChange={(e) =>
                    setAddress({ ...address, state: e.target.value })
                  }
                  className="border rounded p-2"
                  disabled={isFetchingLocation}
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={address.country}
                  onChange={(e) =>
                    setAddress({ ...address, country: e.target.value })
                  }
                  className="border rounded p-2"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={address.phone}
                  onChange={(e) =>
                    setAddress({ ...address, phone: e.target.value })
                  }
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
}
