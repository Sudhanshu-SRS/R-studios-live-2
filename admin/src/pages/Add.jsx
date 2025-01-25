import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { useLocation } from 'react-router-dom';

const Add = ({ token }) => {
  const location = useLocation();
  const item = location.state?.item || {};
  const isEdit = location.state?.isEdit || false;

  const [image1, setImage1] = useState(item.image1 || false);
  const [image2, setImage2] = useState(item.image2 || false);
  const [image3, setImage3] = useState(item.image3 || false);
  const [image4, setImage4] = useState(item.image4 || false);

  const [name, setName] = useState(item.name || "");
  const [description, setDescription] = useState(item.description || "");
  const [price, setPrice] = useState(item.price || "");
  const [category, setCategory] = useState(item.category || "None");
  const [subCategory, setSubCategory] = useState(item.subCategory || "None");
  const [bestseller, setBestseller] = useState(item.bestseller || false);
  const [sizes, setSizes] = useState(item.sizes || []);
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
      case "Lehenga":
        return [
          { value: "None", label: "Select Sub Category" },
          { value: "SiderLehenga", label: "Sider Lehenga" },
          { value: "DesignerLehenga", label: "Designer Lehenga" },
          { value: "BridalLehenga", label: "Bridal Lehenga" },
          { value: "PartyWearLehenga", label: "Party Wear Lehenga" }
        ];
      case "Kurti":
        return [
          { value: "None", label: "Select Sub Category" },
          { value: "SiderKurti", label: "Sider Kurti" },
          { value: "DesignerKurti", label: "Designer Kurti" },
          { value: "BridalKurti", label: "Bridal Kurti" },
          { value: "PartyWearKurti", label: "Party Wear Kurti" }
        ];
      case "Saree":
        return [
          { value: "None", label: "Select Sub Category" },
          { value: "SiderSaree", label: "Sider Saree" },
          { value: "DesignerSaree", label: "Designer Saree" },
          { value: "BridalSaree", label: "Bridal Saree" },
          { value: "PartyWearSaree", label: "Party Wear Saree" }
        ];
      case "Onepiece":
        return [
          { value: "None", label: "Select Sub Category" },
          { value: "SiderOnepiece", label: "Sider Onepiece" },
          { value: "DesignerOnepiece", label: "Designer Onepiece" },
          { value: "BridalOnepiece", label: "Bridal Onepiece" },
          { value: "PartyWearOnepiece", label: "Party Wear Onepiece" }
        ];
      default:
        return [{ value: "None", label: "Select Sub Category" }];
    }
  };

  const toastConfig = {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: true,
    closeButton: false
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

    if (!image1) {
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

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      if (isEdit && item._id) {
        formData.append("id", item._id);
      }

      const url = isEdit 
        ? `${backendUrl}/api/product/update` 
        : `${backendUrl}/api/product/add`;

      const response = await axios.post(url, formData, { headers: { token } });

      setLoading(false);

      if (response.data.success) {
        toast.success(response.data.message, toastConfig);
        setName("");
        setDescription("");
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setPrice("");
        setCategory("None");
        setSubCategory("None");
        setBestseller(false);
        setSizes([]);
      } else {
        toast.error(response.data.message, toastConfig);
      }
    } catch (error) {
      setLoading(false);
      toast.error(error?.response?.data?.message || "Something went wrong", toastConfig);
      console.error("Error adding/updating product:", error);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-center gap-6 py-6 px-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">{isEdit ? "Edit Product" : "Add Product"}</h2>

      {/* Image upload */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        {[image1, image2, image3, image4].map((image, index) => (
          <label key={index} className="w-full h-24 bg-gray-200 flex items-center justify-center rounded-md cursor-pointer">
            <img className="w-full h-full object-cover rounded-md" src={!image ? assets.upload_area : URL.createObjectURL(image)} alt={`image ${index + 1}`} />
            <input onChange={(e) => {
              if (index === 0) setImage1(e.target.files[0]);
              if (index === 1) setImage2(e.target.files[0]);
              if (index === 2) setImage3(e.target.files[0]);
              if (index === 3) setImage4(e.target.files[0]);
            }} type="file" hidden />
          </label>
        ))}
      </div>

      {/* Product name */}
      <div className="w-full mb-4">
        <p className="mb-2 text-gray-600">Product Name</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter product name"
          required
        />
      </div>

      {/* Product description */}
      <div className="w-full mb-4">
        <p className="mb-2 text-gray-600">Product Description</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter product description"
          required
        />
      </div>

      {/* Product price */}
      <div className="w-full mb-4">
        <p className="mb-2 text-gray-600">Product Price</p>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter price"
        />
      </div>

      {/* Category and Sub-category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-4">
        <div>
          <p className="mb-2 text-gray-600">Category</p>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSubCategory("None"); // Reset subcategory when category changes
            }}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-2 text-gray-600">Sub-category</p>
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={category === "None"}
          >
            {getSubCategories(category).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bestseller checkbox */}
      <div className="flex gap-2 items-center mb-4">
        <input
          type="checkbox"
          id="bestseller"
          onChange={() => setBestseller((prev) => !prev)}
          checked={bestseller}
          className="h-5 w-5"
        />
        <label htmlFor="bestseller" className="text-gray-600">Add to bestseller</label>
      </div>

      {/* Submit button */}
      <div className="w-full">
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
          disabled={loading}
        >
          {loading ? 'Submitting...' : (isEdit ? 'Update Product' : 'Add Product')}
        </button>
      </div>
    </form>
  );
};

export default Add;
