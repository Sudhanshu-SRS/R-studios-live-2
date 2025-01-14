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
  const [category, setCategory] = useState(item.category || "Men");
  const [subCategory, setSubCategory] = useState(item.subCategory || "Topwear");
  const [bestseller, setBestseller] = useState(item.bestseller || false);
  const [sizes, setSizes] = useState(item.sizes || []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));
  
      // Add images if selected
      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);
  
      // If editing, add the product ID
      if (isEdit && item._id) {
        formData.append("id", item._id);  // Pass the product ID for updates
      }
  
      const url = isEdit ? `${backendUrl}/api/product/update` : `${backendUrl}/api/product/add`;
      const response = await axios.post(url, formData, { headers: { token } });
  
      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setDescription("");
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setPrice("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };
  

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
      <div>
        <p className="mb-2">Upload Image</p>
        <div className="flex gap-2">
          <label htmlFor="image1">
            <img className="w-20" src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
            <input onChange={(e) => setImage1(e.target.files[0])} type="file" id="image1" hidden />
          </label>
          <label htmlFor="image2">
            <img className="w-20" src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
            <input onChange={(e) => setImage2(e.target.files[0])} type="file" id="image2" hidden />
          </label>
          <label htmlFor="image3">
            <img className="w-20" src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
            <input onChange={(e) => setImage3(e.target.files[0])} type="file" id="image3" hidden />
          </label>
          <label htmlFor="image4">
            <img className="w-20" src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
            <input onChange={(e) => setImage4(e.target.files[0])} type="file" id="image4" hidden />
          </label>
        </div>
      </div>

      <div className="w-full">
        <p className="mb-2">Product name</p>
        <input onChange={(e) => setName(e.target.value)} value={name} className="w-full max-w-[500px] px-3 py-2" type="text" placeholder="Type here" required />
      </div>

      <div className="w-full">
        <p className="mb-2">Product description</p>
        <textarea onChange={(e) => setDescription(e.target.value)} value={description} className="w-full max-w-[500px] px-3 py-2" type="text" placeholder="Write content here" required />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Product category</p>
          <select onChange={(e) => setCategory(e.target.value)} value={category} className="w-full px-3 py-2">
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Bride And Groom">Bride And Groom</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Sub category</p>
          <select onChange={(e) => setSubCategory(e.target.value)} value={subCategory} className="w-full px-3 py-2">
            <option value="Casual">Casual</option>
            <option value="Designer">Designer</option>
            <option value="Formal">Formal</option>
          </select>
        </div>
      </div>

      <div>
        <p className="mb-2">Product Price</p>
        <input onChange={(e) => setPrice(e.target.value)} value={price} className="w-full px-3 py-2 sm:w-[120px]" type="Number" placeholder="Rupees" />
      </div>

      <div>
        <p className="mb-2">Product Sizes</p>
        <div className="flex gap-3">
          <div onClick={() => setSizes((prev) => prev.includes("S") ? prev.filter((item) => item !== "S") : [...prev, "S"])}>
            <p className={`${sizes.includes("S") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>S</p>
          </div>
          <div onClick={() => setSizes((prev) => prev.includes("M") ? prev.filter((item) => item !== "M") : [...prev, "M"])}>
            <p className={`${sizes.includes("M") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>M</p>
          </div>
          <div onClick={() => setSizes((prev) => prev.includes("L") ? prev.filter((item) => item !== "L") : [...prev, "L"])}>
            <p className={`${sizes.includes("L") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>L</p>
          </div>
          <div onClick={() => setSizes((prev) => prev.includes("XL") ? prev.filter((item) => item !== "XL") : [...prev, "XL"])}>
            <p className={`${sizes.includes("XL") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>XL</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <input onChange={() => setBestseller((prev) => !prev)} checked={bestseller} type="checkbox" id="bestseller" />
        <label className="cursor-pointer" htmlFor="bestseller">Add to bestseller</label>
      </div>

      <button type="submit" className="w-28 py-3 mt-4 bg-black text-white">{isEdit ? 'Update' : 'Add'}</button>
    </form>
  );
};

export default Add;
