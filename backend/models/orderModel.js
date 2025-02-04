import mongoose from 'mongoose';

// Add a counter schema for auto-incrementing order IDs
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('counter', counterSchema);

const orderSchema = new mongoose.Schema({
    orderId: { type: Number, unique: true }, // Add numeric order ID
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: 'Order Placed' },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, default: false },
    date: { type: Number, required: true },
    cancellationReason: { type: String },
    // Shiprocket fields
    shiprocketOrderId: { type: String }, // Add this field
    shipmentId: { type: String },
    awbCode: { type: String },
    courierName: { type: String },
    trackingStatus: { type: String },
    trackingUrl: { type: String }
});

// Add pre-save middleware to auto-increment order ID
orderSchema.pre('save', async function(next) {
    try {
        if (this.isNew) {
            const counter = await Counter.findByIdAndUpdate(
                { _id: 'orderId' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.orderId = counter.seq;
        }
        next();
    } catch (error) {
        next(error);
    }
});

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema);
export default orderModel;