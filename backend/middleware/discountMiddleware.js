import { removeExpiredDiscounts } from '../util/discountUtils.js';

export const checkExpiredDiscounts = async (req, res, next) => {
    try {
        // Only check on relevant discount-related routes
        if (req.path.includes('/discounts') || req.path.includes('/product')) {
            await removeExpiredDiscounts();
        }
        next();
    } catch (error) {
        console.error('Discount middleware error:', error);
        next(); // Continue despite error
    }
};