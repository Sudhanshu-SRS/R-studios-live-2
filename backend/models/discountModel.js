import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true,
        index: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Pre-save middleware to validate percentage discount
discountSchema.pre('save', function(next) {
    if (this.discountType === 'percentage' && this.discountValue > 100) {
        next(new Error('Percentage discount cannot exceed 100%'));
    }
    next();
});

const discountModel = mongoose.model('discount', discountSchema);
export default discountModel;