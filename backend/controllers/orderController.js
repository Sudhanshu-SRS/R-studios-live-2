import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe'
import razorpay from 'razorpay'
import { sendEmail } from '../util/email.js';
import productModel from "../models/productModel.js";
import shiprocketService from '../services/shiprocket.js';
import whatsAppService from '../services/whatsappService.js';

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
  <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; color: #333; margin: 0; overflow-x: hidden;">
    <div style="max-width: 700px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1); transition: all 0.3s ease-in-out;">
      <h2 style="text-align: center; color: #2C3E50; font-size: 24px; transition: color 0.3s ease-in-out;">New Order Received!</h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; transition: background-color 0.3s ease-in-out;">
        <h3 style="color: #34495E; font-size: 18px;">Order Details:</h3>
        <p><strong>Order ID:</strong> ${orderDetails._id}</p>
        <p><strong>Customer Name:</strong> ${orderDetails.address.firstName} ${orderDetails.address.lastName}</p>
        <p><strong>Email:</strong> ${orderDetails.address.email}</p>
        <p><strong>Phone:</strong> ${orderDetails.address.phone}</p>
        <p><strong>Total Amount:</strong> ₹${orderDetails.amount}</p>
        <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
        <p><strong>Payment Status:</strong> 
          <span style="color: ${orderDetails.payment ? '#27ae60' : '#c0392b'}; transition: color 0.3s ease-in-out;">
            ${orderDetails.payment ? 'Paid' : 'Pending'}
          </span>
        </p>
        ${transactionId ? `<p><strong>Transaction ID:</strong> ${transactionId}</p>` : ''}

        <h3 style="color: #34495E; font-size: 18px; margin-top: 30px;">Shipping Address:</h3>
        <p>${orderDetails.address.street}</p>
        <p>${orderDetails.address.city}, ${orderDetails.address.state}</p>
        <p>${orderDetails.address.zipcode}, ${orderDetails.address.country}</p>

        <h3 style="color: #34495E; font-size: 18px; margin-top: 30px;">Ordered Items:</h3>
        ${items.map(item => `
          <div style="display: flex; align-items: center; background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 15px; transition: all 0.3s ease-in-out; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <img src="${item.image[0]}" alt="${item.name}" style="width: 80px; height: auto; border-radius: 5px; margin-right: 20px; transition: transform 0.3s ease-in-out;"/>
            <div>
              <p style="margin: 0; font-weight: bold; font-size: 16px;">${item.name}</p>
              <p style="margin: 0; font-size: 14px; color: #7f8c8d;">Size: ${item.size}, Quantity: ${item.quantity}</p>
              <p style="margin: 0; font-size: 14px; color: #2C3E50;">Price: ₹${item.price}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Animation and transition effect -->
    <style>
      body {
        transition: background-color 0.5s ease, color 0.5s ease;
      }

      .container:hover {
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
        transform: translateY(-5px);
      }

      .container h2:hover {
        color: #2980b9;
      }

      .container .item:hover {
        transform: scale(1.05);
      }

      .container img:hover {
        transform: scale(1.1);
      }

      .container .item {
        transition: transform 0.3s ease-in-out;
      }

      .container .item:hover img {
        transform: scale(1.1);
      }
    </style>
  </body>
</html>


        `;

        // Update the customer email template similarly
        const customerEmailHtml = `
       <html>
  <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; color: #333; margin: 0; overflow-x: hidden;">
    <div style="max-width: 700px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1); transition: all 0.3s ease-in-out;">
      <h2 style="text-align: center; color: #2C3E50; font-size: 24px; transition: color 0.3s ease-in-out;">Thank you for your order!</h2>
      
      <p>Dear ${orderDetails.address.firstName},</p>
      <p>Your order has been successfully placed.</p>

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; transition: background-color 0.3s ease-in-out;">
        <h3 style="color: #34495E; font-size: 18px;">Payment & Order Details:</h3>
        <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
        <p><strong>Payment Status:</strong> 
          <span style="color: ${orderDetails.payment ? '#27ae60' : '#c0392b'}; transition: color 0.3s ease-in-out;">
            ${orderDetails.payment ? 'Paid' : 'Pending'}
          </span>
        </p>
        ${transactionId ? `<p><strong>Transaction ID:</strong> ${transactionId}</p>` : ''}

        <h3 style="color: #34495E; font-size: 18px; margin-top: 20px;">Order Summary:</h3>
        <p><strong>Subtotal:</strong> ₹${orderDetails.amount - 150}</p>
        <p><strong>Shipping:</strong> ₹150</p>
        <p><strong>Total Amount:</strong> ₹${orderDetails.amount}</p>

        <h3 style="color: #34495E; font-size: 18px; margin-top: 20px;">Shipping Address:</h3>
        <p>${orderDetails.address.street}</p>
        <p>${orderDetails.address.city}, ${orderDetails.address.state}</p>
        <p>${orderDetails.address.zipcode}, ${orderDetails.address.country}</p>

        <h3 style="color: #34495E; font-size: 18px; margin-top: 30px;">Ordered Items:</h3>
        ${items.map(item => `
          <div style="display: flex; align-items: center; background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 15px; transition: all 0.3s ease-in-out; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <img src="${item.image[0]}" alt="${item.name}" style="width: 80px; height: auto; border-radius: 5px; margin-right: 20px; transition: transform 0.3s ease-in-out;"/>
            <div>
              <p style="margin: 0; font-weight: bold; font-size: 16px;">${item.name}</p>
              <p style="margin: 0; font-size: 14px; color: #7f8c8d;">Size: ${item.size}, Quantity: ${item.quantity}</p>
              <p style="margin: 0; font-size: 14px; color: #2C3E50;">Price: ₹${item.price}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Animation and transition effect -->
    <style>
      body {
        transition: background-color 0.5s ease, color 0.5s ease;
      }

      .container:hover {
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
        transform: translateY(-5px);
      }

      .container h2:hover {
        color: #2980b9;
      }

      .container .item:hover {
        transform: scale(1.05);
      }

      .container img:hover {
        transform: scale(1.1);
      }

      .container .item {
        transition: transform 0.3s ease-in-out;
      }

      .container .item:hover img {
        transform: scale(1.1);
      }
    </style>
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
  // Add WhatsApp notification
  if (orderDetails.address?.phone) {
    console.log('Sending WhatsApp notification to:', orderDetails.address.phone);
    
    try {
      console.log('Sending WhatsApp notification for order:', {
          phone: orderDetails.address.phone,
          name: orderDetails.address.firstName,
          orderId: orderDetails._id
      });

      const result = await whatsAppService.sendOrderConfirmation(  // Changed to sendOrderConfirmation
        orderDetails.address.phone,
        orderDetails  // Pass the entire orderDetails object
    );
        console.log('WhatsApp notification sent:', result);
    } catch (whatsappError) {
        console.error('WhatsApp notification failed:', whatsappError);
        // Continue even if WhatsApp fails
    }
}
} catch (error) {
console.error('Error sending notifications:', error);
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

// In orderController.js
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        // Validate stock first
        await validateStock(items);

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        };

        // Create order in database
        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Create Shiprocket order
        try {
            console.log('Creating Shiprocket order for:', newOrder);
            
            const shipmentResponse = await shiprocketService.createOrder(newOrder);
            console.log('Shiprocket response:', shipmentResponse);

            if (shipmentResponse?.shipment_id) {
                newOrder.shipmentId = shipmentResponse.shipment_id;
                newOrder.shiprocketOrderId = shipmentResponse.shiprocket_order_id;
                newOrder.awbCode = shipmentResponse.awb_code;
                newOrder.courierName = shipmentResponse.courier_name;
                newOrder.trackingUrl = shipmentResponse.awb_code ? 
                    `https://shiprocket.co/tracking/${shipmentResponse.awb_code}` : null;
                await newOrder.save();

                console.log('Order updated with Shiprocket details');
            } else {
                console.error('Missing shipment_id in Shiprocket response');
            }
        } catch (error) {
            console.error('Shiprocket creation error:', error.response?.data || error);
        }

        // Rest of your code...
        await updateProductStock(items);
        await userModel.findByIdAndUpdate(userId, { cartData: {} });
        await sendOrderEmails(newOrder, items);

        res.json({
            success: true,
            message: "Order placed successfully",
            order: newOrder
        });

    } catch (error) {
        console.error('Order placement error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to place order'
        });
    }
};

// Placing orders using Stripe Method
const placeOrderStripe = async (req, res) => {
    try {
        const { items } = req.body;
        
        // Validate stock before creating session
        await validateStock(items);
        
        const { userId, amount, address} = req.body;
        const { origin } = req.headers;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Create Shiprocket order
        try {
            console.log('Creating Shiprocket order for:', newOrder);
            
            const shipmentResponse = await shiprocketService.createOrder(newOrder);
            console.log('Shiprocket response:', shipmentResponse);

            if (shipmentResponse?.shipment_id) {
                newOrder.shipmentId = shipmentResponse.shipment_id;
                newOrder.shiprocketOrderId = shipmentResponse.shiprocket_order_id;
                newOrder.awbCode = shipmentResponse.awb_code;
                newOrder.courierName = shipmentResponse.courier_name;
                newOrder.trackingUrl = shipmentResponse.awb_code ? 
                    `https://shiprocket.co/tracking/${shipmentResponse.awb_code}` : null;
                await newOrder.save();

                console.log('Order updated with Shiprocket details');
            } else {
                console.error('Missing shipment_id in Shiprocket response');
            }
        } catch (error) {
            console.error('Shiprocket creation error:', error.response?.data || error);
            // Continue with order creation even if Shiprocket fails
        }

        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }));

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Charges'
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        });

        res.json({success: true, session_url: session.url});

    } catch (error) {
        console.error('Stripe order error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

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
       // Create Shiprocket order
       try {
        console.log('Creating Shiprocket order with details:', {
            orderId: order._id,
            address: order.address,
            items: order.items
        });
        
        const shipmentResponse = await shiprocketService.createOrder(order);
        console.log('Shiprocket response:', shipmentResponse);

        if (shipmentResponse?.shipment_id) {
            // Update order with shipping details
            order.shipmentId = shipmentResponse.shipment_id;
            order.shiprocketOrderId = shipmentResponse.shiprocket_order_id;
            order.awbCode = shipmentResponse.awb_code;
            order.courierName = shipmentResponse.courier_name;
            order.trackingUrl = shipmentResponse.awb_code ? 
                `https://shiprocket.co/tracking/${shipmentResponse.awb_code}` : null;
            await order.save();
            console.log('Order updated with Shiprocket details');
        }
    } catch (error) {
        console.error('Shiprocket creation error:', error.response?.data || error);
    }

    
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
const updateStatus = async (req, res) => {
    try {
        const { orderId, status, sendEmail: shouldSendEmail } = req.body;
        const order = await orderModel.findById(orderId);

        if (status === "Packing" && shouldSendEmail) {
            const packingEmailHtml = `
            <html>
              <head>
                <style>
                  @keyframes fadeIn {
                    from {
                      opacity: 0;
                      transform: translateY(-10px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
          
                  .email-container {
                    font-family: 'Arial', sans-serif;
                    background-color: #f4f4f4;
                    padding: 40px 0;
                    text-align: center;
                    animation: fadeIn 1.2s ease-in-out;
                  }
          
                  .content-box {
                    max-width: 650px;
                    margin: auto;
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
                  }
          
                  .header {
                    color: #2c3e50;
                    text-align: center;
                    font-size: 28px;
                    font-weight: bold;
                    margin-bottom: 20px;
                  }
          
                  .order-details {
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                    text-align: left;
                  }
          
                  .order-item {
                    display: flex;
                    align-items: center;
                    margin: 10px 0;
                    padding: 10px;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                  }
          
                  .order-item img {
                    width: 60px;
                    height: 60px;
                    object-fit: cover;
                    border-radius: 8px;
                    margin-right: 15px;
                  }
          
                  .button {
                    background-color: #00bfae;
                    color: white;
                    padding: 12px 30px;
                    font-size: 16px;
                    font-weight: bold;
                    border: none;
                    border-radius: 8px;
                    text-decoration: none;
                    display: inline-block;
                    margin-top: 20px;
                    box-shadow: 0 6px 12px rgba(0, 191, 174, 0.4);
                    transition: transform 0.3s ease-in-out;
                  }
          
                  .button:hover {
                    transform: scale(1.05);
                  }
                </style>
              </head>
              <body class="email-container">
                <div class="content-box">
                  <h2 class="header">📦 Order Packing Update</h2>
                  <div class="order-details">
                    <p><strong>Order ID:</strong> #${order._id}</p>
                    <p>We've started packing your order! Our team is carefully preparing your items for shipment.</p>
                  </div>
          
                  <div>
                    <h3 style="color: #2c3e50;">Your Order Items:</h3>
                    ${order.items.map(item => `
                      <div class="order-item">
                        <img src="${item.image[0]}" alt="${item.name}" />
                        <div>
                          <p style="margin: 0; font-weight: bold;">${item.name}</p>
                          <p style="margin: 5px 0; color: #666;">Size: ${item.size} × ${item.quantity}</p>
                        </div>
                      </div>
                    `).join('')}
                  </div>
          
                  <p style="color: #666; margin-top: 20px;">
                    You'll receive another email when your order ships with tracking details.
                  </p>
          
                  <a href="https://www.r-studio.com/orders/${order._id}" class="button">
                    View Order Details
                  </a>
                </div>
              </body>
            </html>
          `;
          

            await sendEmail({
                to: order.address.email,
                subject: `Order #${order._id} - Packing Started`,
                html: packingEmailHtml
            });
        }
        // Add WhatsApp notification
if (order.address?.phone) {
  try {
      console.log('Sending WhatsApp notification for order:', {
          phone: order.address.phone,
          name: order.address.firstName,
          orderId: order._id
      });

      const result = await whatsAppService.sendOrderStatusUpdate( // Use the correct method
          order.address.phone,
          order.address.firstName || 'Customer',
          order._id.toString(),
          'Packing',
          'We have started packing your order and will notify you once it ships.',
          null // tracking URL will be added when shipping is created
      );

      if (result) {
          console.log('WhatsApp packing notification sent successfully');
      } else {
          console.error('WhatsApp notification failed to send');
      }
  } catch (whatsappError) {
      console.error('WhatsApp packing notification failed:', whatsappError);
  }
}

        order.status = status;
        await order.save();

        res.json({
            success: true,
            message: 'Status Updated'
        });

    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Add this function in orderController.js
const cancelOrder = async (req, res) => {
    try {
        const { orderId, reason } = req.body;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Don't allow cancellation of delivered orders
        if (order.status === 'Delivered') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel delivered orders'
            });
        }

        // Cancel in Shiprocket if shipment exists
        if (order.shiprocketOrderId) {
            try {
                await shiprocketService.cancelOrder(order.shiprocketOrderId);
                console.log('Shiprocket order cancelled successfully');
            } catch (error) {
                console.error('Shiprocket cancellation error:', error);
                // Continue with local cancellation even if Shiprocket fails
            }
        }

        // Update order status
        order.status = 'Cancelled';
        order.cancellationReason = reason || 'No reason provided'; // Add fallback
        await order.save();

        // Return cancelled products to stock
        for (const item of order.items) {
            await productModel.findOneAndUpdate(
                { 
                    _id: item._id,
                    'sizes.size': item.size 
                },
                {
                    $inc: { 
                        'sizes.$.quantity': item.quantity 
                    }
                }
            );
        } 
        // Update order status and add reason
        order.status = 'Cancelled';
        order.cancellationReason = reason; // Add this field to your order model
        await order.save();

        // Send cancellation email with reason
        try {
            const cancelEmailHtml = `
<html>
  <head>
    <style>
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .email-container {
        font-family: 'Arial', sans-serif;
        background-color: #f9f9f9;
        padding: 40px 0;
        text-align: center;
        animation: fadeIn 1.2s ease-in-out;
      }

      .content-box {
        max-width: 650px;
        margin: auto;
        background-color: #ffffff;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        animation: fadeIn 1.5s ease-in-out;
      }

      .header {
        color: #e74c3c;
        text-align: center;
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 20px;
      }

      .order-details {
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
        text-align: left;
      }

      .order-item {
        display: flex;
        align-items: center;
        margin: 10px 0;
        padding: 10px;
        background-color: #f8f9fa;
        border-radius: 8px;
      }

      .order-item img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 8px;
        margin-right: 15px;
      }

      .button {
        background-color: #e74c3c;
        color: white;
        padding: 12px 30px;
        font-size: 16px;
        font-weight: bold;
        border: none;
        border-radius: 8px;
        text-decoration: none;
        display: inline-block;
        margin-top: 20px;
        box-shadow: 0 6px 12px rgba(231, 76, 60, 0.4);
        transition: transform 0.3s ease-in-out;
      }

      .button:hover {
        transform: scale(1.05);
      }
    </style>
  </head>
  <body class="email-container">
    <div class="content-box">
      <h2 class="header">🚫 Order Cancellation Confirmation</h2>
      <div class="order-details">
        <p><strong>Customer Name:</strong> ${order.address.firstName} ${order.address.lastName}</p>
        <p><strong>Order ID:</strong> #${order._id}</p>
        <p><strong>Cancellation Date:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Amount:</strong> ₹${order.amount}</p>
        <p><strong>Cancellation Reason:</strong> ${reason}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p style="color: #777; font-size: 14px;">
          The amount will be refunded within 4-5 banking days. If not, please contact our customer support.
        </p>
      </div>

      <div>
        <h3 style="color: #2c3e50;">Cancelled Items:</h3>
        ${order.items.map(item => `
          <div class="order-item">
            <img src="${item.image[0]}" alt="${item.name}" />
            <div>
              <p style="margin: 0; font-weight: bold;">${item.name}</p>
              <p style="margin: 5px 0; color: #666;">Size: ${item.size} × ${item.quantity}</p>
              <p style="margin: 0; color: #666;">₹${item.price}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <p style="color: #666; margin-top: 30px;">
        If you have any questions about this cancellation, please contact our customer support.
      </p>

      <a href="https://www.r-studio.com/support" class="button">
        Contact Support
      </a>
    </div>
  </body>
</html>
`;


            await sendEmail({
                to: order.address.email,
                subject: `Order Cancelled - #${order._id}`,
                html: cancelEmailHtml
            });

            // Send admin notification
            await sendEmail({
                to: process.env.ADMIN_EMAIL,
                subject: `Order Cancellation Alert - #${order._id}`,
                html: cancelEmailHtml
            });

        } catch (emailError) {
            console.error('Failed to send cancellation email:', emailError);
            // Continue with cancellation even if email fails
        }
          // Send WhatsApp notification
        if (order.address?.phone) {
          try {
              await whatsAppService.sendOrderCancellationNotification(
                  order.address.phone,
                  {
                      _id: order._id,
                      amount: order.amount
                  },
                  reason
              );
          } catch (whatsappError) {
              console.error('WhatsApp cancellation notification failed:', whatsappError);
          }
      }

        res.json({
            success: true,
            message: 'Order cancelled successfully'
        });

    } catch (error) {
        console.error('Order cancellation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to cancel order'
        });
    }
};
const TRACKING_CACHE = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getOrderTracking = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderModel.findById(orderId);
        
        // Check cache first
        const cached = TRACKING_CACHE.get(order.awbCode);
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            return res.json({
                success: true,
                tracking: cached.data,
                cached: true
            });
        }

        const trackingDetails = await shiprocketService.getTracking(order.awbCode);
        
        // Update cache
        TRACKING_CACHE.set(order.awbCode, {
            timestamp: Date.now(),
            data: trackingDetails
        });

        res.json({
            success: true,
            tracking: trackingDetails,
            cached: false
        });
    } catch (error) {
        console.error('Tracking fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tracking details'
        });
    }
};

const sendTrackingWhatsApp = async (req, res) => {
  try {
      const { orderId } = req.params;
      const order = await orderModel.findById(orderId);
      
      if (!order || !order.awbCode) {
          return res.status(404).json({
              success: false,
              message: 'Order or tracking details not found'
          });
      }

      if (!order.address?.phone) {
          return res.status(400).json({
              success: false,
              message: 'No phone number found for customer'
          });
      }

      // Get latest tracking details
      const trackingDetails = await shiprocketService.getTracking(order.awbCode);

      // Format expected delivery date
      const etd = trackingDetails.tracking_data?.etd 
          ? new Date(trackingDetails.tracking_data.etd).toLocaleDateString()
          : 'Pending';

      // Send WhatsApp message
      const sent = await whatsAppService.sendTrackingUpdate(
          order.address.phone,
          order._id.toString(),
          order.courierName,
          order.awbCode,
          etd,
          trackingDetails.current_status || 'Pending'
      );

      if (sent) {
          // Update order to mark notification as sent
          order.trackingNotificationSent = true;
          order.lastTrackingNotification = new Date();
          await order.save();

          res.json({
              success: true,
              message: 'Tracking update sent successfully'
          });
      } else {
          throw new Error('Failed to send WhatsApp notification');
      }

  } catch (error) {
      console.error('Send tracking WhatsApp error:', error);
      res.status(500).json({
          success: false,
          message: error.message || 'Failed to send tracking update'
      });
  }
};


export {
    verifyRazorpay,
    verifyStripe,
    placeOrder,
    placeOrderStripe,
    placeOrderRazorpay,
    allOrders,
    userOrders,
    updateStatus,
    cancelOrder, // Add this export
    updateProductStock,
    sendOrderEmails,
    getOrderTracking,
    sendTrackingWhatsApp,
}