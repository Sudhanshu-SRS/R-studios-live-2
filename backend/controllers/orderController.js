import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe'
import razorpay from 'razorpay'
import { sendEmail } from '../util/email.js';
import productModel from "../models/productModel.js";

// global variables
const currency = 'inr'
const deliveryCharge = 150

// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const razorpayInstance = new razorpay({
    key_id : process.env.RAZORPAY_KEY_ID,
    key_secret : process.env.RAZORPAY_KEY_SECRET,
})

// Add this function to send order confirmation emails
const sendOrderEmails = async (orderDetails, items, transactionId = null) => {
    try {
        // Admin email template
        const adminEmailHtml = `
            <html>
  <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; color: #333;">
    <div style="max-width: 700px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
      <h2 style="text-align: center; color: #2C3E50;">New Order Received!</h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
        <h3 style="color: #34495E;">Order Details:</h3>
        <p><strong>Order ID:</strong> ${orderDetails._id}</p>
        <p><strong>Customer Name:</strong> ${orderDetails.address.firstName} ${orderDetails.address.lastName}</p>
        <p><strong>Email:</strong> ${orderDetails.address.email}</p>
        <p><strong>Phone:</strong> ${orderDetails.address.phone}</p>
        <p><strong>Total Amount:</strong> ₹${orderDetails.amount}</p>
        <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
        <p><strong>Payment Status:</strong> 
          <span style="color: ${orderDetails.payment ? '#27ae60' : '#c0392b'};">
            ${orderDetails.payment ? 'Paid' : 'Pending'}
          </span>
        </p>
        ${transactionId ? `<p><strong>Transaction ID:</strong> ${transactionId}</p>` : ''}

        <h3 style="color: #34495E; margin-top: 20px;">Shipping Address:</h3>
        <p>${orderDetails.address.street}</p>
        <p>${orderDetails.address.city}, ${orderDetails.address.state}</p>
        <p>${orderDetails.address.zipcode}, ${orderDetails.address.country}</p>

        <h3 style="color: #34495E; margin-top: 30px;">Ordered Items:</h3>
        ${items.map(item => `
          <div style="display: flex; align-items: center; background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
            <img src="${item.image[0]}" alt="${item.name}" style="width: 80px; height: auto; border-radius: 5px; margin-right: 15px;" />
            <div>
              <p style="margin: 0; font-weight: bold;">${item.name}</p>
              <p style="margin: 0; font-size: 14px;">Size: ${item.size}, Quantity: ${item.quantity}</p>
              <p style="margin: 0; font-size: 14px; color: #2C3E50;">Price: ₹${item.price}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </body>
</html>

        `;

        // Update the customer email template similarly
        const customerEmailHtml = `
           <html>
  <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; color: #333;">
    <div style="max-width: 700px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
      <h2 style="text-align: center; color: #2C3E50;">Thank you for your order!</h2>
      
      <p>Dear ${orderDetails.address.firstName},</p>
      <p>Your order has been successfully placed.</p>

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
        <h3 style="color: #34495E;">Payment & Order Details:</h3>
        <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
        <p><strong>Payment Status:</strong> 
          <span style="color: ${orderDetails.payment ? '#27ae60' : '#c0392b'};">
            ${orderDetails.payment ? 'Paid' : 'Pending'}
          </span>
        </p>
        ${transactionId ? `<p><strong>Transaction ID:</strong> ${transactionId}</p>` : ''}

        <h3 style="color: #34495E; margin-top: 20px;">Order Summary:</h3>
        <p><strong>Subtotal:</strong> ₹${orderDetails.amount - 150}</p>
        <p><strong>Shipping:</strong> ₹150</p>
        <p><strong>Total Amount:</strong> ₹${orderDetails.amount}</p>

        <h3 style="color: #34495E; margin-top: 20px;">Shipping Address:</h3>
        <p>${orderDetails.address.street}</p>
        <p>${orderDetails.address.city}, ${orderDetails.address.state}</p>
        <p>${orderDetails.address.zipcode}, ${orderDetails.address.country}</p>

        <h3 style="color: #34495E; margin-top: 30px;">Ordered Items:</h3>
        ${items.map(item => `
          <div style="display: flex; align-items: center; background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
            <img src="${item.image[0]}" alt="${item.name}" style="width: 80px; height: auto; border-radius: 5px; margin-right: 15px;" />
            <div>
              <p style="margin: 0; font-weight: bold;">${item.name}</p>
              <p style="margin: 0; font-size: 14px;">Size: ${item.size}, Quantity: ${item.quantity}</p>
              <p style="margin: 0; font-size: 14px; color: #2C3E50;">Price: ₹${item.price}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </body>
</html>

        `;

        // Send emails
        await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: `New Order Received - #${orderDetails._id}`,
            html: adminEmailHtml
        });

        await sendEmail({
            to: orderDetails.address.email,
            subject: `Order Confirmation - R-Studio #${orderDetails._id}`,
            html: customerEmailHtml
        });

    } catch (error) {
        console.error('Error sending order emails:', error);
    }
};

// Function to update product sales data
const updateProductSalesData = async (item) => {
    const saleRecord = {
        date: new Date(),
        quantity: item.quantity,
        price: item.price
    };

    await productModel.findByIdAndUpdate(
        item._id,
        {
            $push: { 'salesData.sales': saleRecord },
            $inc: {
                'salesData.totalSold': item.quantity,
                'salesData.revenue': item.quantity * item.price
            },
            $set: { 'salesData.lastUpdated': new Date() }
        }
    );
};

// Add this function to update stock when order is placed
const updateProductStock = async (items) => {
    try {
        for (const item of items) {
            // Use atomic update operation
            const result = await productModel.findOneAndUpdate(
                { 
                    _id: item._id,
                    'sizes.size': item.size 
                },
                {
                    $inc: { 
                        'sizes.$.quantity': -item.quantity,
                    }
                },
                { new: true }
            );

            if (result) {
                // Update inStock status
                const hasStock = result.sizes.some(s => s.quantity > 0);
                await productModel.findByIdAndUpdate(
                    item._id,
                    { 
                        inStock: hasStock,
                        $inc: {
                            'salesData.totalSold': item.quantity,
                            'salesData.revenue': item.price * item.quantity
                        },
                        $set: {
                            'salesData.lastUpdated': new Date()
                        }
                    }
                );
            }
        }
    } catch (error) {
        console.error('Stock update error:', error);
        throw error;
    }
};

const validateStock = async (items) => {
    for (const item of items) {
        const product = await productModel.findById(item._id);
        if (!product) {
            throw new Error(`Product ${item._id} not found`);
        }

        const sizeData = product.sizes.find(s => s.size === item.size);
        if (!sizeData || sizeData.quantity < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name} (${item.size})`);
        }
    }
    return true;
};

// Placing orders using COD Method
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        // First update stock
        await updateProductStock(items);

        // Then create order
        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Clear cart
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        // Fetch updated products
        const updatedProducts = await productModel.find({
            _id: { $in: items.map(item => item._id) }
        });

        res.json({ 
            success: true, 
            message: "Order Placed Successfully",
            updatedProducts 
        });

    } catch (error) {
        console.error('Order placement error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Placing orders using Stripe Method
const placeOrderStripe = async (req,res) => {
    try {
        const { items } = req.body;
        
        // Validate stock before creating session
        await validateStock(items);
        
        const { userId, amount, address} = req.body
        const { origin } = req.headers;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"Stripe",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const line_items = items.map((item) => ({
            price_data: {
                currency:currency,
                product_data: {
                    name:item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency:currency,
                product_data: {
                    name:'Delivery Charges'
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:  `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        })

        res.json({success:true,session_url:session.url});

    } catch (error) {
        console.error('Stripe order error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
}

// Verify Stripe 
const verifyStripe = async (req, res) => {
    const { orderId, success } = req.body;

    try {
        if (success === "true") {
            const order = await orderModel.findById(orderId);
            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            // Update order status
            order.payment = true;
            await order.save();

            // Update product stock
            await updateProductStock(order.items);

            // Clear user's cart
            await userModel.findByIdAndUpdate(order.userId, { cartData: {} });

            // Send confirmation emails
            await sendOrderEmails(order, order.items);

            res.json({ success: true });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false });
        }
    } catch (error) {
        console.error('Stripe verification error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req, res) => {
    try {
        const { items } = req.body;
        
        // Validate stock before creating order
        await validateStock(items);
        
        const { userId, amount, address } = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Razorpay",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const options = {
            amount: amount * 100,
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString()
        };

        await razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                return res.json({ success: false, message: error });
            }
            res.json({ success: true, order });
        });

    } catch (error) {
        console.error('Razorpay order error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// Verify Razorpay payment and send emails
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id } = req.body;

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
        
        if (orderInfo.status === 'paid') {
            const order = await orderModel.findByIdAndUpdate(
                orderInfo.receipt, 
                { 
                    payment: true,
                    transactionId: razorpay_payment_id // Store the payment ID
                },
                { new: true }
            );

            // Update product stock
            await updateProductStock(order.items);

            // Clear cart
            await userModel.findByIdAndUpdate(order.userId, { cartData: {} });

            // Send confirmation emails with transaction ID
            await sendOrderEmails(order, order.items, razorpay_payment_id);

            // Get updated products for frontend
            const updatedProducts = await productModel.find({
                _id: { $in: order.items.map(item => item._id) }
            });

            res.json({ 
                success: true, 
                message: "Payment Successful",
                updatedProducts
            });
        } else {
            res.json({ 
                success: false, 
                message: 'Payment Failed' 
            });
        }
    } catch (error) {
        console.error('Razorpay verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Payment verification failed'
        });
    }
};

// All Orders data for Admin Panel
const allOrders = async (req,res) => {

    try {
        
        const orders = await orderModel.find({})
        res.json({success:true,orders})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// User Order Data For Forntend
const userOrders = async (req,res) => {
    try {
        
        const { userId } = req.body

        const orders = await orderModel.find({ userId })
        res.json({success:true,orders})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// update order status from Admin Panel
const updateStatus = async (req,res) => {
    try {
        
        const { orderId, status } = req.body

        await orderModel.findByIdAndUpdate(orderId, { status })
        res.json({success:true,message:'Status Updated'})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

export {verifyRazorpay, verifyStripe ,placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus,updateProductStock,}