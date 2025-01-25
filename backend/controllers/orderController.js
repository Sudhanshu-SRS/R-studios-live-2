import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe'
import razorpay from 'razorpay'
import { sendEmail } from '../util/email.js';

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
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>New Order Received!</h2>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
                        <h3>Order Details:</h3>
                        <p><strong>Order ID:</strong> ${orderDetails._id}</p>
                        <p><strong>Customer Name:</strong> ${orderDetails.address.firstName} ${orderDetails.address.lastName}</p>
                        <p><strong>Email:</strong> ${orderDetails.address.email}</p>
                        <p><strong>Phone:</strong> ${orderDetails.address.phone}</p>
                        <p><strong>Total Amount:</strong> ₹${orderDetails.amount}</p>
                        <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
                        <p><strong>Payment Status:</strong> ${orderDetails.payment ? 'Paid' : 'Pending'}</p>
                        ${transactionId ? `<p><strong>Transaction ID:</strong> ${transactionId}</p>` : ''}
                        
                        <h3>Shipping Address:</h3>
                        <p>${orderDetails.address.street}</p>
                        <p>${orderDetails.address.city}, ${orderDetails.address.state}</p>
                        <p>${orderDetails.address.zipcode}, ${orderDetails.address.country}</p>
                        
                        <h3>Ordered Items:</h3>
                        ${items.map(item => `
                            <div style="margin-bottom: 10px;">
                                <img src="${item.image[0]}" alt="${item.name}" style="width: 100px; height: auto;"/>
                                <p><strong>${item.name}</strong></p>
                                <p>Size: ${item.size}, Quantity: ${item.quantity}</p>
                                <p>Price: ₹${item.price}</p>
                            </div>
                        `).join('')}
                    </div>
                </body>
            </html>
        `;

        // Update the customer email template similarly
        const customerEmailHtml = `
            <html>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Thank you for your order!</h2>
                    <p>Dear ${orderDetails.address.firstName},</p>
                    <p>Your order has been successfully placed.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
                        <h3>Payment & Order Details:</h3>
                        <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
                        <p><strong>Payment Status:</strong> ${orderDetails.payment ? 'Paid' : 'Pending'}</p>
                        ${transactionId ? `<p><strong>Transaction ID:</strong> ${transactionId}</p>` : ''}
                        
                        <h3>Order Summary:</h3>
                        <p><strong>Subtotal:</strong> ₹${orderDetails.amount - 150}</p>
                        <p><strong>Shipping:</strong> ₹150</p>
                        <p><strong>Total Amount:</strong> ₹${orderDetails.amount}</p>
                        
                        <h3>Shipping Address:</h3>
                        <p>${orderDetails.address.street}</p>
                        <p>${orderDetails.address.city}, ${orderDetails.address.state}</p>
                        <p>${orderDetails.address.zipcode}, ${orderDetails.address.country}</p>
                        
                        <h3>Ordered Items:</h3>
                        ${items.map(item => `
                            <div style="margin-bottom: 10px;">
                                <img src="${item.image[0]}" alt="${item.name}" style="width: 100px; height: auto;"/>
                                <p><strong>${item.name}</strong></p>
                                <p>Size: ${item.size}, Quantity: ${item.quantity}</p>
                                <p>Price: ₹${item.price}</p>
                            </div>
                        `).join('')}
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

// Placing orders using COD Method
const placeOrder = async (req,res) => {
    
    try {
        
        const { userId, items, amount, address} = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"COD",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId,{cartData:{}})

        // Send confirmation emails
        await sendOrderEmails(newOrder, items);

        res.json({success:true,message:"Order Placed"})


    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// Placing orders using Stripe Method
const placeOrderStripe = async (req,res) => {
    try {
        
        const { userId, items, amount, address} = req.body
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
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// Verify Stripe 
const verifyStripe = async (req,res) => {

    const { orderId, success, userId } = req.body

    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, {payment:true});
            await userModel.findByIdAndUpdate(userId, {cartData: {}})
            res.json({success: true});
        } else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({success:false})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

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
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Verify Razorpay payment and send emails
const verifyRazorpay = async (req, res) => {
    try {
        const { userId, razorpay_order_id, razorpay_payment_id } = req.body;

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
        
        if (orderInfo.status === 'paid') {
            const order = await orderModel.findByIdAndUpdate(
                orderInfo.receipt, 
                { payment: true },
                { new: true }
            ).exec();

            await userModel.findByIdAndUpdate(userId, { cartData: {} });

            // Send confirmation emails after successful payment
            await sendOrderEmails(order, order.items,razorpay_payment_id);

            res.json({ 
                success: true, 
                message: "Payment Successful" 
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
            message: error.message
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

export {verifyRazorpay, verifyStripe ,placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus}