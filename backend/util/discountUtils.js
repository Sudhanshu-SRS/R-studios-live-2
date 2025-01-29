import discountModel from '../models/discountModel.js';
import productModel from '../models/productModel.js';

export const removeExpiredDiscounts = async () => {
    try {
        // Find all expired but still active discounts
        const expiredDiscounts = await discountModel.find({
            active: true,
            endDate: { $lt: new Date() }
        });

        // Deactivate expired discounts
        for (const discount of expiredDiscounts) {
            // Update discount status
            await discountModel.findByIdAndUpdate(discount._id, {
                active: false
            });

            // Update product's current discount reference
            await productModel.findByIdAndUpdate(discount.productId, {
                currentDiscount: null
            });
        }

        return {
            success: true,
            count: expiredDiscounts.length
        };
    } catch (error) {
        console.error('Error removing expired discounts:', error);
        return {
            success: false,
            error: error.message
        };
    }
};