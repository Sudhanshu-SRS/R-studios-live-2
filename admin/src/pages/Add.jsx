import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from 'react-router-dom';

const Add = ({ token }) => {
  const location = useLocation();
  const navigate = useNavigate(); // Add this line
  const item = location.state?.item || {};
  const isEdit = location.state?.isEdit || false;

  // Store existing images from the product
  const [existingImages, setExistingImages] = useState(item.image || []);
    
  // State for new images
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  // Function to remove existing image
  const handleRemoveExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const [name, setName] = useState(item.name || "");
  const [description, setDescription] = useState(item.description || "");
  const [price, setPrice] = useState(item.price || "");
  const [category, setCategory] = useState(item.category || "None");
  const [subCategory, setSubCategory] = useState(item.subCategory || "None");
  const [bestseller, setBestseller] = useState(item.bestseller || false);
  const [sizes, setSizes] = useState(item?.sizes?.map(s => s.size) || []);
  const [sizeQuantities, setSizeQuantities] = useState(
    item?.sizes?.reduce((acc, s) => ({
      ...acc,
      [s.size]: s.quantity.toString()
    }), {}) || {}
  );
  const [loading, setLoading] = useState(false);

  

  const categoryOptions = [
    { value: "None", label: "Select Category" },
    { value: "Men", label: "Men" },
    { value: "Women", label: "Women" },
    { value: "Bride And Groom", label: "Bride And Groom" },
    { value: "Lehenga", label: "Lehenga" },
    { value: "Kurti", label: "Kurti" },
    { value: "Saree", label: "Saree" },
    { value: "Onepiece", label: "Onepiece" },
  ];

  const getSubCategories = (selectedCategory) => {
    switch(selectedCategory) {
      case "Men":
        return [
          { value: "None", label: "Select Sub Category" },
          { value: "Casual", label: "Casual" },
          { value: "Designer", label: "Designer" },
          { value: "Formal", label: "Formal" }
        ];
      case "Women":
        return [
          { value: "None", label: "Select Sub Category" },
          { value: "Casual", label: "Casual" },
          { value: "Designer", label: "Designer" },
          { value: "Formal", label: "Formal" }
        ];
      case "Bride And Groom":
        return [
          { value: "None", label: "Select Sub Category" },
          { value: "HaldiCeremony", label: " Haldi Ceremony " },
          { value: "SangeetCeremony", label: " Sangeet Ceremony " },
          { value: "MehandiCeremony", label: " Mehandi Ceremony " },
          { value: "SaptapadiCeremony", label: " Saptapadi Ceremony " },
          { value: "KanyadaanCeremony", label: " Kanyadaan Ceremony " },
          { value: "ReceptionCeremony", label: " Reception Ceremony " }
         ];

      case "Lehenga":
        return [
          { value: "None", label: "Select Sub Category" },
          { value: "ALineLehenga", label: " A Line Lehenga " },
          { value: "StraightCutLehenga", label: " Straight Cut Lehenga " },
          { value: "BridalLehenga", label: "Bridal Lehenga" },
          { value: "PartyWearLehenga", label: "Party Wear Lehenga" },
          { value: "FlaredLehenga", label: " Flared Lehenga " } ,
          { value: "FishTail", label: " Fish Tail Lehenga " },
          { value: "NetLehenga", label: " Net Lehenga " },
          { value: "IndoWesternLehenga", label: " Indo Western Lehenga " },
          { value: "DesignerLehenga", label: " Designer Lehenga " },
          { value: "WesternLehenga", label: " Western Lehenga " }
        ];
      case "Kurti":
        return [
          { value: "None", label: "Select Sub Category" },
          { value: "ALineKurti", label: " A Line Kurti " },
          { value: "DesignerKurti", label: "Designer Kurti" },
          { value: "AnarkaliKurti", label: " Anarkali Kurti " },
          { value: "PartyWearKurti", label: "Party Wear Kurti" },
          { value: "KaftanKurti", label: " Kaftan Kurti " },
          { value: "DhotiKurti", label: " Dhoti Kurti " },
          { value: "IndoWesternKurti", label: " Indo Western Kurti " },
          { value: "WesternKurti", label: " Western Kurti " },
          { value: "ChikankariKurti", label: " Chikankari Kurti " },
          { value: "PrintedKurti", label: " Printed Kurti " },
          { value: "DenimKurti", label: " Denim Kurti " },
          { value: "JacketKurti", label: " Jacket Kurti " }

        ];
      case "Saree":
        return [
          { value: "None", label: "Select Sub Category" },
          { value: "KanchipuramSaree", label: " Kanchipuram Saree " },
          { value: "DesignerSaree", label: "Designer Saree" },
          { value: "BanarasiSaree", label: " Banarasi Saree " },
          { value: "PartyWearSaree", label: "Party Wear Saree" },
          { value: "PaithaniSaree", label: " Paithani Saree " },
          { value: "ChanderiSaree", label: " Chanderi Saree " },
          { value: "NauvariSaree", label: " Nauvari Saree " },
          { value: "CottonSaree", label: " Cotton Saree " },
          { value: "SilkSaree", label: " Silk Saree " },
          { value: "OrganzaSaree", label: " Organza Saree " },
          { value: "WesternSaree", label: " Western Saree " },
          { value: "IndoWesternSaree", label: " Indo Western Saree " }

   ];
      case "Onepiece":
        return [
          { value: "None", label: "Select Sub Category" },
          { value: "JumpsuitOnepiece", label: " Jumpsuit Onepiece " },
          { value: "DesignerOnepiece", label: "Designer Onepiece" },
          { value: "WesternOnepiece", label: " Western Onepiece " },
          { value: "PartyWearOnepiece", label: "Party Wear Onepiece" },
          { value: "BodycanOnepiece", label: " Bodycan Onepiece " },
          { value: "ALineOnepiece", label: " A Line Onepiece " },
          { value: "IShoulderOnepiece", label: " I Shoulder Onepiece " },
          { value: "BallGownOnepiece", label: " Ball Gown Onepiece " }

        ];
      default:
        return [{ value: "None", label: "Select Sub Category" }];
    } 
};

  const toastConfig = {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: true,
    closeButton: false
  };

  const validateSizesAndQuantities = () => {
    // Check if any sizes are selected
    if (sizes.length === 0) {
        toast.error("Please select at least one size and its quantity", toastConfig);
        setValidationErrors(prev => ({
            ...prev,
            sizes: true
        }));
        return false;
    }

    // Extract size values if they're objects
    const sizeValues = sizes.map(size => typeof size === 'object' ? size.size : size);

    // Only validate quantities for selected sizes
    const invalidSizes = sizeValues.filter(size => {
        const quantity = sizeQuantities[size];
        const parsedQuantity = parseInt(quantity);
        return !quantity || isNaN(parsedQuantity) || parsedQuantity < 0;
    });

    if (invalidSizes.length > 0) {
        toast.error(`Please enter valid quantities for sizes: ${invalidSizes.join(', ')}`, toastConfig);
        setValidationErrors(prev => ({
            ...prev,
            sizes: invalidSizes
        }));
        return false;
    }

    // Check if at least one selected size has quantity > 0
    const hasStock = sizeValues.some(size => parseInt(sizeQuantities[size]) > 0);
    if (!hasStock) {
        toast.error("Please enter a quantity greater than 0 for at least one selected size", toastConfig);
        setValidationErrors(prev => ({
            ...prev,
            sizes: sizeValues
        }));
        return false;
    }

    // Prepare sizes data for submission
    const formattedSizes = sizeValues.map(size => ({
        size: size,
        quantity: parseInt(sizeQuantities[size]) || 0
    }));

    // Update sizes state with formatted data
    setSizes(formattedSizes);
    setValidationErrors(prev => ({...prev, sizes: []}));
    return true;
};

const handleSizeQuantityChange = (size, value) => {
    // Basic input validation
    if (value === '' || value < 0) {
        value = '';
    }
    
    setSizeQuantities(prev => ({
        ...prev,
        [size]: value
    }));
};

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (category === "None") {
        toast.error("Please select a category", toastConfig);
        return;
    }

    if (subCategory === "None") {
        toast.error("Please select a sub-category", toastConfig);
        return;
    }

    // Validate sizes and quantities
    if (!validateSizesAndQuantities()) {
        return;
    }

    if (!image1 && !isEdit) {
        toast.error("At least one image is required", toastConfig);
        return;
    }

    setLoading(true);
    try {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("category", category);
        formData.append("subCategory", subCategory);
        formData.append("bestseller", bestseller);
        formData.append("sizes", JSON.stringify(sizes));
        formData.append("sizeQuantities", JSON.stringify(sizeQuantities));
        formData.append("existingImages", JSON.stringify(existingImages));

        // Only append new images if they exist
        if (image1) formData.append("image1", image1);
        if (image2) formData.append("image2", image2);
        if (image3) formData.append("image3", image3);
        if (image4) formData.append("image4", image4);

        if (isEdit && item._id) {
            formData.append("id", item._id);
        }

        const url = isEdit 
            ? `${backendUrl}/api/product/update` 
            : `${backendUrl}/api/product/add`;

        const response = await axios.post(url, formData, {
            headers: { 
                token,
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.success) {
            toast.success(response.data.message);
            navigate('/list'); // Now this will work
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        console.error("Error adding/updating product:", error);
        toast.error(error?.response?.data?.message || "Failed to update product");
    } finally {
        setLoading(false);
    }
};

const handleSizeChange = (size, isChecked) => {
    if (isChecked) {
        setSizes(prev => [...prev, size]);
        setSizeQuantities(prev => ({
            ...prev,
            [size]: '0' // Initialize with zero
        }));
    } else {
        setSizes(prev => prev.filter(s => s !== size));
        // Remove the quantity for unselected size
        setSizeQuantities(prev => {
            const newQuantities = {...prev};
            delete newQuantities[size];
            return newQuantities;
        });
    }
};

  // Progress tracking
  const [formProgress, setFormProgress] = useState({
    images: false,
    details: false,
    sizes: false
  });

  // Validation feedback
  const [validationErrors, setValidationErrors] = useState({
    images: '',
    name: '',
    description: '',
    price: '',
    category: '',
    sizes: ''
  });

  // Enhanced validation
  const validateForm = () => {
    const errors = {};
    
    if (!image1 && !isEdit && existingImages.length === 0) {
        errors.images = 'At least one product image is required';
    }
    if (!name.trim()) {
        errors.name = 'Product name is required';
    }
    if (!description.trim()) {
        errors.description = 'Product description is required';
    }
    if (!price || price <= 0) {
        errors.price = 'Valid price is required';
    }
    if (category === 'None') {
        errors.category = 'Please select a category';
    }
    if (sizes.length === 0) {
        errors.sizes = 'Please select at least one size';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={onSubmitHandler} className="space-y-8 bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <p className="text-gray-600 mt-2">
            Fill in the details below to {isEdit ? "update" : "add"} your product
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-8">
          {['Images', 'Details', 'Sizes'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${formProgress[step.toLowerCase()] 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'}
              `}>
                {index + 1}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600">{step}</span>
              {index < 2 && <div className="w-12 h-0.5 mx-4 bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* Image Upload Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">Product Images</h3>
          {validationErrors.images && (
            <p className="text-red-500 text-sm">{validationErrors.images}</p>
          )}
          
          {/* Existing Images */}
          {isEdit && existingImages.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Current Images</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {existingImages.map((img, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden">
                    <img 
                      src={img} 
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover transition-transform duration-200 group-hover:scale-110"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Image Upload */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[image1, image2, image3, image4].map((image, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors"
              >
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (index === 0) setImage1(file);
                    if (index === 1) setImage2(file);
                    if (index === 2) setImage3(file);
                    if (index === 3) setImage4(file);
                  }}
                />
                {image ? (
                  <>
                    <img 
                      src={URL.createObjectURL(image)} 
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (index === 0) setImage1(null);
                        if (index === 1) setImage2(null);
                        if (index === 2) setImage3(null);
                        if (index === 3) setImage4(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="mt-2 text-sm text-gray-500">Add Image</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-700">Product Details</h3>
          
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="4"
              placeholder="Enter product description"
              required
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter price"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sub Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Sub Category</label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              {getSubCategories(category).map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sizes and Quantities Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
                Sizes and Quantities <span className="text-red-500">*</span>
            </label>

            {/* Bulk Quantity Setter */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                    <input
                        type="number"
                        className="w-32 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Set all qty"
                        min="0"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            const value = document.querySelector('input[placeholder="Set all qty"]').value;
                            if (value) {
                                // First, select all sizes if not already selected
                                const allSizes = ['S', 'M', 'L', 'XL', 'XXL'];
                                const newSizes = [...new Set([...sizes, ...allSizes])];
                                setSizes(newSizes);

                                // Then set quantities for all sizes
                                const newQuantities = {};
                                newSizes.forEach(size => {
                                    newQuantities[size] = value;
                                });
                                setSizeQuantities(newQuantities);

                                toast.success('Applied quantity to all sizes');
                            } else {
                                toast.error('Please enter a quantity first');
                            }
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                    >
                        Apply to All
                    </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                    Select all sizes and set the same quantity for them at once
                </p>
            </div>

            {/* Individual Size Selectors */}
            <div className="flex flex-wrap gap-4">
                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <div key={size} className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={sizes.includes(size)}
                            onChange={(e) => handleSizeChange(size, e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        <span>{size}</span>
                        {sizes.includes(size) && (
                            <input
                                type="number"
                                value={sizeQuantities[size] || ''}
                                onChange={(e) => handleSizeQuantityChange(size, e.target.value)}
                                className={`w-20 px-2 py-1 border rounded-md ${
                                    validationErrors.sizes?.includes(size) 
                                        ? 'border-red-500' 
                                        : 'border-gray-300'
                                }`}
                                placeholder="Qty"
                                min="1"
                                required
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/list')}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`
              px-6 py-2 rounded-lg text-white
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'}
              transition-colors duration-200
            `}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              isEdit ? 'Update Product' : 'Add Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};


export default Add;
