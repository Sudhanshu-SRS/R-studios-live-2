import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import discountModel from "../models/discountModel.js"; // Add this import
import mongoose from 'mongoose';

// function for add product
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, sizeQuantities } = req.body;

        // Parse sizes and quantities
        let parsedSizes;
        try {
            const sizesArray = JSON.parse(sizes);
            const quantitiesObj = JSON.parse(sizeQuantities || '{}');
            
            // Validate sizes
            const validSizes = ['S', 'M', 'L', 'XL', 'XXL'];
            parsedSizes = sizesArray
                .filter(size => validSizes.includes(size))
                .map(size => ({
                    size: size,
                    quantity: parseInt(quantitiesObj[size] || 0)
                }));

            if (parsedSizes.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one valid size is required'
                });
            }
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid size format'
            });
        }

        // Handle images
        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url;
            })
        );

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            sizes: parsedSizes,
            image: imagesUrl,
            date: Date.now(),
            inStock: parsedSizes.some(size => size.quantity > 0)
        };

        const product = new productModel(productData);
        await product.save();

        res.json({ success: true, message: "Product Added" });

    } catch (error) {
        console.error("Product addition error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to add product'
        });
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {
        // First get all products
        const products = await productModel.find({});
        
        // Get active discounts
        const discounts = await discountModel.find({
            active: true,
            endDate: { $gt: new Date() }
        });

        // Map discounts to products with proper error handling
        const productsWithDiscounts = products.map(product => {
            try {
                const discount = discounts.find(d => 
                    d.productId.toString() === product._id.toString()
                );
                
                // Calculate effective price if discount exists
                const effectivePrice = discount ? 
                    discount.discountType === 'percentage' ?
                        product.price * (1 - discount.discountValue / 100) :
                        product.price - discount.discountValue
                    : product.price;

                return {
                    ...product.toObject(),
                    discount: discount ? {
                        discountType: discount.discountType,
                        discountValue: discount.discountValue,
                        endDate: discount.endDate
                    } : null,
                    effectivePrice
                };
            } catch (error) {
                console.error(`Error processing product ${product._id}:`, error);
                return {
                    ...product.toObject(),
                    discount: null,
                    effectivePrice: product.price
                };
            }
        });

        res.json({
            success: true, 
            products: productsWithDiscounts
        });

    } catch (error) {
        console.error('List products error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};
// function for update product
const update = async (req, res) => {
    try {
        const { id, existingImages } = req.body;
        
        // Validate input
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid product ID' 
            });
        }

        // Parse sizes and quantities
        let updatedData = { ...req.body };
        if (typeof req.body.sizes === 'string') {
            try {
                const sizesArray = JSON.parse(req.body.sizes);
                const sizeQuantities = JSON.parse(req.body.sizeQuantities || '{}');
                
                // Validate and format sizes
                const validSizes = ['S', 'M', 'L', 'XL', 'XXL'];
                updatedData.sizes = sizesArray
                    .filter(size => validSizes.includes(size))
                    .map(size => ({
                        size: size, // Using the size string directly
                        quantity: parseInt(sizeQuantities[size] || 0)
                    }));

                // Validate that we have at least one valid size
                if (updatedData.sizes.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'At least one valid size is required'
                    });
                }
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid sizes or quantities format'
                });
            }
        }

        // Handle images
        let imagesUrl = [];
        if (existingImages) {
            imagesUrl = JSON.parse(existingImages);
        } else if (req.files && Object.keys(req.files).length > 0) {
            imagesUrl = await Promise.all(
                Object.values(req.files).map(async (file) => {
                    const result = await cloudinary.uploader.upload(file[0].path, {
                        resource_type: 'image'
                    });
                    return result.secure_url;
                })
            );
        }

        // Update product with new data
        const updatedProduct = await productModel.findByIdAndUpdate(
            id,
            {
                ...updatedData,
                image: imagesUrl,
                inStock: updatedData.sizes.some(size => size.quantity > 0)
            },
            { 
                new: true,
                runValidators: true
            }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({ 
            success: true, 
            message: "Product Updated Successfully",
            product: updatedProduct 
        });

    } catch (error) {
        console.error("Product update error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to update product'
        });
    }
};

// function for removing product
const removeProduct = async (req, res) => {
    try {
        
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Product Removed"})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const updateProductPrice = async (req, res) => {
  try {
    const { productId, newPrice } = req.body;
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    product.price = newPrice;
    await product.save();

    res.status(200).json({ success: true, message: 'Price updated successfully.', product });
  } catch (error) {
    console.error('Error updating product price:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateAllPrices = async (req, res) => {
  try {
    const { newPrice } = req.body;
    await productModel.updateMany({}, { price: newPrice });

    res.status(200).json({ success: true, message: 'All prices updated successfully.' });
  } catch (error) {
    console.error('Error updating all prices:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Add new endpoint to update stock
const updateStock = async (req, res) => {
    try {
        const { productId, size, quantity } = req.body;

        // Validate size
        const validSizes = ['S', 'M', 'L', 'XL', 'XXL'];
        if (!validSizes.includes(size)) {
            return res.status(400).json({ 
                success: false, 
                message: `Invalid size. Must be one of: ${validSizes.join(', ')}` 
            });
        }

        // Validate quantity
        const parsedQuantity = parseInt(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a non-negative number'
            });
        }

        // Find and update product using updateOne to bypass schema validation
        const result = await productModel.updateOne(
            { 
                _id: productId,
                'sizes.size': size 
            },
            {
                $set: { 
                    'sizes.$.quantity': parsedQuantity 
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product or size not found' 
            });
        }

        // Update inStock status
        const product = await productModel.findById(productId);
        if (product) {
            const hasStock = product.sizes.some(s => s.quantity > 0);
            await productModel.updateOne(
                { _id: productId },
                { $set: { inStock: hasStock }}
            );
        }

        res.json({ 
            success: true, 
            message: 'Stock updated successfully' 
        });

    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to update stock'
        });
    }
};

// Add a function to update bestseller status based on sales
const updateBestsellerStatus = async () => {
    try {
        // Get all products sorted by total sales
        const products = await productModel.find({})
            .sort({ 'salesData.totalSold': -1 })
            .limit(10); // Top 10 products

        // Update bestseller status
        await productModel.updateMany({}, { bestseller: false }); // Reset all
        
        // Set top products as bestsellers
        for (const product of products) {
            if (product.salesData?.totalSold > 0) {
                await productModel.findByIdAndUpdate(product._id, {
                    bestseller: true
                });
            }
        }
    } catch (error) {
        console.error('Error updating bestseller status:', error);
    }
};

export { listProducts, addProduct, removeProduct, singleProduct, updateProductPrice, updateAllPrices, update, updateStock }