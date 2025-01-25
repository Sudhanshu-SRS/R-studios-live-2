import { createContext, useEffect, useState,useRef, useContext } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
    const currency = "₹";
    const delivery_fee = 150;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [search, setSearch] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [userData, setUserData] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [showVerifyPopup, setShowVerifyPopup] = useState(false);
    const popupTimerRef = useRef(null); // Add ref for timer
    const navigate = useNavigate();

    const getUserData = async () => {
        try {
            const storedToken = token || localStorage.getItem("token");
            if (!storedToken) return;

            const response = await axios.get(`${backendUrl}/api/user/profile`, {
                headers: {
                    Authorization: `Bearer ${storedToken}`,
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            if (response.data.success) {
                setUserData(response.data.user);
                setIsVerified(response.data.user.isAccountVerified);
                return response.data.user;
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            if (error?.response?.status === 401) {
                localStorage.removeItem("token");
                setToken(null);
            }
        }
    };

    // Add product to the cart
    const addToCart = async (itemId, size) => {
        if (!token) {
            toast.error("Please login to add items to cart");
            navigate("/login");
            return;
        }

        if (!size) {
            toast.error("Select Product Size");
            return;
        }

        try {
            const response = await axios.post(
                `${backendUrl}/api/cart/add`,
                { itemId, size },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                const cartData = structuredClone(cartItems);
                cartData[itemId] = cartData[itemId] || {};
                cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
                setCartItems(cartData);
                toast.success("Item added to cart successfully");
            }
        } catch (error) {
            if (error?.response?.status === 401) {
                localStorage.removeItem("token");
                setToken(null);
                navigate("/login");
            }
            console.error("Add to cart error:", error);
            toast.error("Failed to add item to cart");
        }
    };

    // Get total cart item count
    const getCartCount = () => {
        return Object.values(cartItems).reduce(
            (total, item) =>
                total + Object.values(item).reduce((sum, count) => sum + count, 0),
            0
        );
    };

    // Update product quantity in cart
    const updateQuantity = async (itemId, size, quantity) => {
        const cartData = structuredClone(cartItems);
        cartData[itemId][size] = quantity;
        setCartItems(cartData);

        if (token) {
            try {
                await axios.post(
                    `${backendUrl}/api/cart/update`,
                    { itemId, size, quantity },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (error) {
                console.error(error);
                toast.error(error.message);
            }
        }
    };

    // Calculate the total cart amount
    const getCartAmount = () => {
        return Object.entries(cartItems).reduce((total, [itemId, sizes]) => {
            const product = products.find((p) => p._id === itemId);
            return (
                total +
                Object.entries(sizes).reduce(
                    (subtotal, [size, count]) => subtotal + (product?.price || 0) * count,
                    0
                )
            );
        }, 0);
    };

    // Fetch product data from the backend
    const getProductsData = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/product/list`);
            if (response.data.success) {
                setProducts(response.data.products.reverse());
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    // Token persistence: Sync state with localStorage
    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
        }
    }, [token]);

    // Check authentication state on mount and token change
    useEffect(() => {
        if (token) {
            getUserData();
            getUserCart(token);
        }
    }, [token]);

    // Fetch the user cart from the backend
    const getUserCart = async (token) => {
        try {
            const response = await axios.post(
                `${backendUrl}/api/cart/get`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                setCartItems(response.data.cartData);
            }
        } catch (error) {
            if (error?.response?.status === 401) {
                localStorage.removeItem("token");
                setToken(null);
                navigate("/login");
            }
            console.error("Cart fetch error:", error);
        }
    };

    // Fetch products on mount
    useEffect(() => {
        getProductsData();
    }, []);
    const handleVerifyPopup = () => {
        // Clear any existing timer
        if (popupTimerRef.current) {
            clearTimeout(popupTimerRef.current);
        }

        // Close the popup
        setShowVerifyPopup(false);

        // Set new timer only if user is unverified
        if (userData && !userData.isAccountVerified) {
            popupTimerRef.current = setTimeout(() => {
                setShowVerifyPopup(true);
            }, 3 * 60 * 1000); // 3 minutes
        }
    };
     
    // Check verification status on mount and userData changes
    useEffect(() => {
        if (userData && !userData.isAccountVerified && !showVerifyPopup) {
            setShowVerifyPopup(true);
        }
    }, [userData]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (popupTimerRef.current) {
                clearTimeout(popupTimerRef.current);
            }
        };
    }, []);
    // Lifecycle: Trigger verification popup if account is not verified
    useEffect(() => {
        let popupTimer;
        if (userData && !userData.isAccountVerified && !showVerifyPopup) {
            popupTimer = setTimeout(() => {
                setShowVerifyPopup(true);
            }, 3 * 60 * 1000); // 3 minutes
        }
        return () => clearTimeout(popupTimer);
    }, [userData, showVerifyPopup]);

    const value = {
        products,
        currency,
        delivery_fee,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        cartItems,
        addToCart,
        setCartItems,
        getCartCount,
        updateQuantity,
        getCartAmount,
        navigate,
        backendUrl,
        setToken,
        token,
        getUserData,
        userData,
        setUserData,
        isVerified,
        showVerifyPopup,
        setShowVerifyPopup,handleVerifyPopup
    };

    return <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>;
};

export default ShopContextProvider;
