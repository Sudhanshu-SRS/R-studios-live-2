import { createContext, useEffect, useState,useRef, useContext } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PopupVerify  from "../components/PopupVerify";
export const ShopContext = createContext(null);

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
            if (!product) return total;
            
            // Calculate price with discount
            const effectivePrice = product.discount 
                ? (product.discount.discountType === 'percentage'
                    ? product.price * (1 - product.discount.discountValue / 100)
                    : product.price - product.discount.discountValue)
                : product.price;

            return total + Object.entries(sizes).reduce(
                (subtotal, [size, count]) => subtotal + effectivePrice * count,
                0
            );
        }, 0);
    };

    // Fetch product data from the backend
    const getProductsData = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/product/list`);
            
            if (response.data.success) {
                const productsWithDiscounts = response.data.products.map(product => ({
                    ...product,
                    price: product.effectivePrice || product.price,
                    originalPrice: product.price,
                    discount: product.discount
                }));

                // console.log('Products with discounts:', productsWithDiscounts);
                setProducts(productsWithDiscounts.reverse());
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
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
        const verificationInProgress = localStorage.getItem('verificationInProgress');
        
        if (userData && 
            !userData.isAccountVerified && 
            !showVerifyPopup && 
            !verificationInProgress) {
          popupTimer = setTimeout(() => {
            setShowVerifyPopup(true);
          }, 3 * 60 * 1000); // 3 minutes
        }
        
        return () => clearTimeout(popupTimer);
      }, [userData, showVerifyPopup]);
    
    const placeOrder = async (orderData) => {
        try {
            const response = await axios.post(
                `${backendUrl}/api/order/place`,
                orderData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setCartItems({});
                // Immediately refresh products after order
                await refreshAllProducts();
                return response;
            }
        } catch (error) {
            console.error('Order placement error:', error);
            throw error;
        }
    };
   
    // // Add refresh stock function
    // const refreshStock = async (productId) => {
    //     try {
    //         const response = await axios.get(`${backendUrl}/api/product/single`, {
    //             params: { productId },
    //             headers: { Authorization: `Bearer ${token}` }
    //         });
            
    //         if (response.data.success) {
    //             setProducts(prev => prev.map(p => 
    //                 p._id === productId ? response.data.product : p
    //             ));
    //             return response.data.product;
    //         }
    //     } catch (error) {
    //         console.error('Error refreshing stock:', error);
    //     }
    // };

    // Add function to refresh all products
    const refreshAllProducts = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/product/list`);
            if (response.data.success) {
                // Update products and ensure they're sorted by date
                const updatedProducts = response.data.products
                    .sort((a, b) => b.date - a.date);
                setProducts(updatedProducts);
            }
        } catch (error) {
            console.error('Error refreshing products:', error);
        }
    };

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
        setShowVerifyPopup,
        handleVerifyPopup,
        placeOrder,
        
        refreshAllProducts
    };

    return (
        <ShopContext.Provider value={value}>
            {props.children}
            {showVerifyPopup && (
                <PopupVerify onClose={() => setShowVerifyPopup(false)} />
            )}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
