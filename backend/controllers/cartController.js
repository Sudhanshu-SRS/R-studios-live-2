import userModel from "../models/userModel.js"


// add products to user cart
const addToCart = async (req,res) => {
    try {
        
        const { userId, itemId, size } = req.body

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1
            }
            else {
                cartData[itemId][size] = 1
            }
        } else {
            cartData[itemId] = {}
            cartData[itemId][size] = 1
        }

        await userModel.findByIdAndUpdate(userId, {cartData})

        res.json({ success: true, message: "Added To Cart" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const addToCartClient = async (itemId, size) => {
    if (!token) {
        toast.error("Please login to add items to cart");
        navigate("/login");
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
            // Update cart items
            const cartData = structuredClone(cartItems);
            cartData[itemId] = cartData[itemId] || {};
            cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
            setCartItems(cartData);

            // Update product stock in products state
            setProducts(prevProducts => 
                prevProducts.map(product => {
                    if (product._id === itemId) {
                        return {
                            ...product,
                            sizes: product.sizes.map(sizeData => ({
                                ...sizeData,
                                quantity: sizeData.size === size ? 
                                    Math.max(0, sizeData.quantity - 1) : 
                                    sizeData.quantity
                            }))
                        };
                    }
                    return product;
                })
            );

            toast.success("Item added to cart successfully");
        }
    } catch (error) {
        // Error handling...
    }
};

// update user cart
const updateCart = async (req,res) => {
    try {
        
        const { userId ,itemId, size, quantity } = req.body

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        cartData[itemId][size] = quantity

        await userModel.findByIdAndUpdate(userId, {cartData})
        res.json({ success: true, message: "Cart Updated" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// get user cart data
const getUserCart = async (req,res) => {

    try {
        
        const { userId } = req.body
        
        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        res.json({ success: true, cartData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

export { addToCart, updateCart, getUserCart }