import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import mongoose from 'mongoose';
// function for add product
const addProduct = async (req, res) => {
    try {

        const { name, description, price, category, subCategory, sizes, bestseller } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now()
        }

        console.log(productData);

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {
        
        const products = await productModel.find({});
        res.json({success:true,products})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
// function for update product
const update = async (req, res) => {
    try {
        const { id, name, description, price, category, subCategory, bestseller, sizes } = req.body;

        // Ensure price is a number and sizes is parsed correctly
        const parsedPrice = Number(price);
        const parsedSizes = sizes ? JSON.parse(sizes) : [];

        // Ensure id is a valid ObjectId
        const productId = new mongoose.Types.ObjectId(id); // Correct usage of ObjectId

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        // Update the product fields
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = parsedPrice || product.price;
        product.category = category || product.category;
        product.subCategory = subCategory || product.subCategory;
        product.bestseller = bestseller === "true" ? true : false || product.bestseller;
        product.sizes = parsedSizes.length ? parsedSizes : product.sizes;

        // Handle image uploads
        let imagesUrl = [];
        if (req.files) {
            if (req.files.image1) imagesUrl.push(req.files.image1[0].path);
            if (req.files.image2) imagesUrl.push(req.files.image2[0].path);
            if (req.files.image3) imagesUrl.push(req.files.image3[0].path);
            if (req.files.image4) imagesUrl.push(req.files.image4[0].path);
        }

        // Upload images to Cloudinary
        if (imagesUrl.length > 0) {
            let uploadedImages = await Promise.all(
                imagesUrl.map(async (imagePath) => {
                    let result = await cloudinary.uploader.upload(imagePath, { resource_type: 'image' });
                    return result.secure_url;
                })
            );
            product.image = uploadedImages;
        }

        // Save the product
        await product.save();

        res.status(200).json({ success: true, message: 'Product updated successfully.', product });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
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

export { listProducts, addProduct, removeProduct, singleProduct, updateProductPrice, updateAllPrices, update }