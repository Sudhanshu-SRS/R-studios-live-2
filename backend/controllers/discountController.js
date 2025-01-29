import discountModel from '../models/discountModel.js';
import productModel from '../models/productModel.js';

// Add new discount
const addDiscount = async (req, res) => {
    try {
        const { productId, discountType, discountValue, startDate, endDate } = req.body;

        // Validate product exists
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check for existing active discount
        const existingDiscount = await discountModel.findOne({
            productId,
            active: true,
            endDate: { $gt: new Date() }
        });

        if (existingDiscount) {
            return res.status(400).json({
                success: false,
                message: 'Product already has an active discount'
            });
        }

        // Create new discount
        const discount = new discountModel({
            productId,
            discountType,
            discountValue,
            startDate: startDate || new Date(),
            endDate: new Date(endDate)
        });

        await discount.save();

        res.json({
            success: true,
            message: 'Discount added successfully',
            discount
        });

    } catch (error) {
        console.error('Error adding discount:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add discount'
        });
    }
};

// Function to remove expired discounts
const removeExpiredDiscounts = async () => {
    try {
        await discountModel.updateMany(
            { endDate: { $lt: new Date() } },
            { active: false }
        );
    } catch (error) {
        console.error('Error removing expired discounts:', error);
    }
};

// Get all active discounts
const getDiscounts = async (req, res) => {
    try {
        // First, clean up expired discounts
        await removeExpiredDiscounts();

        // Then fetch active discounts
        const discounts = await discountModel.find({
            active: true,
            endDate: { $gt: new Date() }
        }).populate('productId');

        res.json({
            success: true,
            discounts: discounts.map(d => ({
                ...d.productId.toObject(),
                discountType: d.discountType,
                discountValue: d.discountValue,
                endDate: d.endDate
            }))
        });
    } catch (error) {
        console.error('Error fetching discounts:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Remove discount
const removeDiscount = async (req, res) => {
    try {
        const { productId } = req.params;

        await discountModel.updateMany(
            { productId },
            { active: false }
        );

        res.json({
            success: true,
            message: 'Discount removed successfully'
        });

    } catch (error) {
        console.error('Error removing discount:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to remove discount'
        });
    }
};

export { addDiscount, getDiscounts, removeDiscount };