import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    description: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true,
        min: 0 
    },
    image: { 
        type: Array, 
        required: true,
        validate: {
            validator: function(v) {
                return v.length > 0;
            },
            message: 'At least one image is required'
        }
    },
    category: { 
        type: String, 
        required: true,
        enum: ['Men', 'Women', 'Bride And Groom', 'Lehenga', 'Kurti', 'Saree', 'Onepiece']
    },
    subCategory: { 
        type: String, 
        required: true 
    },
    sizes: [{ 
        size: { 
            type: String, 
            required: true,
            enum: ['S', 'M', 'L', 'XL', 'XXL'] // Only these values are allowed
        },
        quantity: { 
            type: Number, 
            required: true,
            default: 0,
            min: 0 
        }
    }],
    bestseller: { 
        type: Boolean,
        default: false 
    },
    date: { 
        type: Number, 
        required: true,
        default: Date.now 
    },
    inStock: {
        type: Boolean,
        default: true
    },
    salesData: {
        sales: [{
            date: {
                type: Date,
                required: true,
                default: Date.now
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }],
        totalSold: {
            type: Number,
            default: 0
        },
        revenue: {
            type: Number,
            default: 0
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    currentDiscount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'discount',
        default: null
    }
});

productSchema.index({ 'salesData.totalSold': -1 });

// Add method to check stock availability
productSchema.methods.hasStock = function(size, quantity) {
    const sizeData = this.sizes.find(s => s.size === size);
    return sizeData && sizeData.quantity >= quantity;
};

// Add method to update stock
productSchema.methods.updateStock = function(size, quantity) {
    const sizeData = this.sizes.find(s => s.size === size);
    if (sizeData) {
        sizeData.quantity -= quantity;
        if (sizeData.quantity < 0) sizeData.quantity = 0;
        this.inStock = this.sizes.some(s => s.quantity > 0);
        return true;
    }
    return false;
};

// Add method to replenish stock
productSchema.methods.addStock = function(size, quantity) {
    const sizeData = this.sizes.find(s => s.size === size);
    if (sizeData) {
        sizeData.quantity += quantity;
        this.inStock = true;
        return true;
    }
    return false;
};

// Virtual for total stock
productSchema.virtual('totalStock').get(function() {
    return this.sizes.reduce((total, size) => total + size.quantity, 0);
});

// Pre-save middleware to check if product is in stock
productSchema.pre('save', function(next) {
    this.inStock = this.sizes.some(s => s.quantity > 0);
    next();
});

// Add method to update sales data
productSchema.methods.updateSalesData = function(quantity, price) {
    this.salesData.totalSold += quantity;
    this.salesData.revenue += quantity * price;
    this.salesData.lastUpdated = Date.now();
};

// Add method to update sales data and stock
productSchema.methods.processSale = async function(size, quantity, price) {
    // Find and update the specific size quantity
    const sizeData = this.sizes.find(s => s.size === size);
    if (sizeData) {
        sizeData.quantity = Math.max(0, sizeData.quantity - quantity);
    }

    // Update sales tracking data
    this.salesData = this.salesData || {};
    this.salesData.totalSold = (this.salesData.totalSold || 0) + quantity;
    this.salesData.revenue = (this.salesData.revenue || 0) + (quantity * price);
    this.salesData.lastUpdated = Date.now();

    // Update overall stock status
    this.inStock = this.sizes.some(s => s.quantity > 0);
    
    // Save the changes
    await this.save();
};

// Add method to check stock status
productSchema.methods.checkStockStatus = function() {
    const hasStock = this.sizes.some(size => size.quantity > 0);  // Fixed syntax error
    this.inStock = hasStock;
    return hasStock;
};

// Add method to calculate discounted price
productSchema.methods.getDiscountedPrice = async function() {
    if (!this.currentDiscount) return this.price;

    const discount = await mongoose.model('discount').findOne({
        _id: this.currentDiscount,
        active: true,
        endDate: { $gt: new Date() }
    });

    if (!discount) {
        this.currentDiscount = null;
        await this.save();
        return this.price;
    }

    return discount.discountType === 'percentage'
        ? this.price * (1 - discount.discountValue / 100)
        : Math.max(0, this.price - discount.discountValue);
};

// Add a method to check if product is bestseller
productSchema.methods.updateBestsellerStatus = function() {
    // Product is bestseller if it has significant sales
    this.bestseller = this.salesData?.totalSold > 0;
};

// Add pre-save middleware to check bestseller status
productSchema.pre('save', function(next) {
    this.updateBestsellerStatus();
    next();
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;