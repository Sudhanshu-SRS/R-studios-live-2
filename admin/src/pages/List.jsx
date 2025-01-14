import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [newPrice, setNewPrice] = useState({});
  const [bulkPrice, setBulkPrice] = useState('');
  const navigate = useNavigate();

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list');
      if (response.data.success) {
        setList(response.data.products.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const updatePrice = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/product/updatePrice',
        { productId: id, newPrice: newPrice[id] },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const updateAllPrices = async () => {
    try {
      const response = await axios.post(
        backendUrl + '/api/product/updateAllPrices',
        { newPrice: bulkPrice },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleEdit = (item) => {
    navigate('/add', { state: { item, isEdit: true } });
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <div className='my-4 flex '>
        <p className='mr-4'>Update all prices to:</p>
        <input
          type="number"
          value={bulkPrice}
          onChange={(e) => setBulkPrice(e.target.value)}
          placeholder="New price for all items"
          className="border px-2 py-1 sm:w-48 w-full mb-2 sm:mb-0"
        />
        <button 
          onClick={updateAllPrices} 
          className="ml-2 bg-green-500 text-white rounded-3xl  px-4 py-2 sm:w-auto w-full"
        >
          Update All Prices
        </button>
      </div>
      <p className='mb-2'>All Products List</p>
      <div className='flex flex-col gap-2'>
        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className='text-center'>Action</b>
        </div>
        {list.map((item, index) => (
          <div className='grid grid-cols-1 sm:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
            <img className='w-12 sm:w-16' src={item.image[0]} alt="" />
            <p className='text-xs sm:text-base'>{item.name}</p>
            <p className='text-xs sm:text-base'>{item.category}</p>
            <div className='flex flex-col sm:flex-row items-center gap-2'>
              <input
                type="number"
                value={newPrice[item._id] || item.price}
                onChange={(e) => setNewPrice({ ...newPrice, [item._id]: e.target.value })}
                className="border px-2 py-1 sm:w-32 w-full"
              />
              <button 
                onClick={() => updatePrice(item._id)} 
                className="ml-2 bg-blue-500 text-white px-2 py-1 sm:w-auto w-full"
              >
                Update
              </button>
            </div>
            <div className='flex items-center justify-center gap-2'>
              <button 
                onClick={() => handleEdit(item)} 
                className="ml-2 bg-yellow-500 text-white rounded-lg px-4 py-2 sm:px-6 sm:py-2 hover:bg-yellow-400 hover:text-lime-500 hover:scale-105 transition-all duration-200 w-full sm:w-auto"
              >
                Edit
              </button>
              <p 
                onClick={() => removeProduct(item._id)}
                className='text-right md:text-center cursor-pointer text-lg'
              >
                X
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default List;
