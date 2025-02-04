import express from 'express'
import {
    placeOrder, 
    placeOrderStripe, 
    placeOrderRazorpay, 
    allOrders, 
    userOrders, 
    updateStatus, 
    verifyStripe, 
    verifyRazorpay,
    cancelOrder, // Add this import
    getOrderTracking,
    sendTrackingWhatsApp,      
} from '../controllers/orderController.js'
import adminAuth  from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'
import mongoose from 'mongoose'
import orderModel from '../models/orderModel.js' // Add this import
import shiprocketService from '../services/shiprocket.js' // Add this import
const orderRouter = express.Router()

// Add the cancel route
orderRouter.post('/cancel', adminAuth, cancelOrder)

// Admin Features
orderRouter.post('/list',adminAuth,allOrders)
orderRouter.post('/status',adminAuth,updateStatus)

// Payment Features
orderRouter.post('/place',authUser,placeOrder)
orderRouter.post('/stripe',authUser,placeOrderStripe)
orderRouter.post('/razorpay',authUser,placeOrderRazorpay)

// User Feature 
orderRouter.post('/userorders',authUser,userOrders)

// verify payment
orderRouter.post('/verifyStripe',authUser, verifyStripe)
orderRouter.post('/verifyRazorpay',authUser, verifyRazorpay)
orderRouter.delete('/cleanup-cancelled', adminAuth, async (req, res) => {
    try {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        // Find cancelled orders first
        const cancelledOrders = await orderModel.find({
            status: "Cancelled",
            updatedAt: { $lt: twoDaysAgo }
        });

        // Return items to stock before deleting orders
        for (const order of cancelledOrders) {
            try {
                // Add each item's quantity back to product stock
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

                    // Update product's inStock status
                    const product = await productModel.findById(item._id);
                    if (product) {
                        const hasStock = product.sizes.some(s => s.quantity > 0);
                        await productModel.updateOne(
                            { _id: item._id },
                            { $set: { inStock: hasStock }}
                        );
                    }
                }
            } catch (error) {
                console.error(`Error restoring stock for order ${order._id}:`, error);
            }
        }

        // Delete the cancelled orders
        const result = await orderModel.deleteMany({
            status: "Cancelled",
            updatedAt: { $lt: twoDaysAgo }
        });

        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} cancelled orders and restored stock`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error cleaning up cancelled orders:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to cleanup cancelled orders'
        });
    }
});
orderRouter.get('/tracking/:orderId', adminAuth, async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await orderModel.findById(orderId);
        
        if (!order || !order.awbCode) {
            return res.status(404).json({
                success: false,
                message: 'Order or tracking details not found'
            });
        }

        // Use real Shiprocket API call instead of mock data
        const trackingDetails = await shiprocketService.getTracking(order.awbCode);
        
        return res.json({
            success: true,
            tracking: {
                awbCode: order.awbCode,
                courierName: order.courierName,
                trackingUrl: order.trackingUrl,
                current_status: trackingDetails.current_status,
                tracking_data: trackingDetails.tracking_data
            }
        });

    } catch (error) {
        console.error('Tracking fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tracking details'
        });
    }
});
orderRouter.post('/send-tracking-whatsapp/:orderId', adminAuth, sendTrackingWhatsApp);

export default orderRouter