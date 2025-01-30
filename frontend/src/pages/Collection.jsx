import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { HiFilter } from 'react-icons/hi';
import { motion } from 'framer-motion';

// Add this to track available products
const getAvailableProducts = (products) => {
  return products.filter(product => product.sizes.some(size => size.quantity > 0));
};

const Collection = () => {
  const { products, search, showSearch, refreshAllProducts } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [productType, setProductType] = useState([]); 
  const [lehengaType, setLehengaType] = useState([]);
  const [sortType, setSortType] = useState('relevant');
  const [subCategory, setSubCategory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory(prev => prev.filter(item => item !== e.target.value))
    } else {
      setCategory(prev => [...prev, e.target.value])
    }
  }

  // Separate toggle functions for each filter type
  const toggleType = (e) => {
    if (productType.includes(e.target.value)) {
      setProductType(prev => prev.filter(item => item !== e.target.value));
    } else {
      setProductType(prev => [...prev, e.target.value]);
    }
  };

  const toggleLehengaType = (e) => {
    if (lehengaType.includes(e.target.value)) {
      setLehengaType(prev => prev.filter(item => item !== e.target.value));
    } else {
      setLehengaType(prev => [...prev, e.target.value]);
    }
  };

  // Add toggleSubCategory function
  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory(prev => prev.filter(item => item !== e.target.value));
    } else {
      setSubCategory(prev => [...prev, e.target.value]);
    }
  };

  // Initial load of products
  useEffect(() => {
    if (products.length > 0) {
      const availableProducts = getAvailableProducts(products);
      setFilterProducts(availableProducts);
      setIsLoading(false);
    }
  }, [products]);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    if (products.length > 0) {
      applyFilter();
    }
  }, [category, productType, lehengaType, subCategory, search, showSearch, products]);

  // Apply sorting whenever sort type changes
  useEffect(() => {
    if (filterProducts.length > 0) {
      sortProduct();
    }
  }, [sortType]);

  // Updated filter function
  const applyFilter = () => {
    let productsCopy = getAvailableProducts(products);

    if (showSearch && search) {
      productsCopy = productsCopy.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => 
        category.includes(item.category)
      );
    }

    if (productType.length > 0) {
      productsCopy = productsCopy.filter(item => 
        productType.includes(item.subCategory)
      );
    }

    if (lehengaType.length > 0) {
      productsCopy = productsCopy.filter(item => 
        lehengaType.includes(item.subCategory)
      );
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter(item => 
        item.sizes.some(size => subCategory.includes(size))
      );
    }

    setFilterProducts(productsCopy);
  };

  const getDiscountedPrice = (product) => {
    console.log('Collection page discount calculation:', {
        product: product.name,
        originalPrice: product.price,
        discount: product.discount
    });

    if (!product.discount) return product.price;
    
    const discountedPrice = product.discount.discountType === 'percentage'
        ? product.price * (1 - product.discount.discountValue / 100)
        : Math.max(0, product.price - product.discount.discountValue);
        
    console.log('Collection page calculated price:', {
        original: product.price,
        discounted: discountedPrice,
        discountType: product.discount.discountType,
        discountValue: product.discount.discountValue
    });

    return Math.round(discountedPrice * 100) / 100;
};

// First, update the sortProduct function to handle discounted sorting
const sortProduct = () => {
    let fpCopy = filterProducts.slice();
    switch (sortType) {
        case 'low-high':
            fpCopy.sort((a, b) => getDiscountedPrice(a) - getDiscountedPrice(b));
            break;
        case 'high-low':
            fpCopy.sort((a, b) => getDiscountedPrice(b) - getDiscountedPrice(a));
            break;
        case 'discounted':
            // Put discounted items first, sorted by discount percentage
            fpCopy.sort((a, b) => {
                const aHasDiscount = Boolean(a.discount);
                const bHasDiscount = Boolean(b.discount);
                
                if (aHasDiscount && !bHasDiscount) return -1;
                if (!aHasDiscount && bHasDiscount) return 1;
                
                if (aHasDiscount && bHasDiscount) {
                    // Calculate discount percentages for comparison
                    const aDiscount = a.discount.discountType === 'percentage' 
                        ? a.discount.discountValue 
                        : (a.discount.discountValue / a.price) * 100;
                    
                    const bDiscount = b.discount.discountType === 'percentage'
                        ? b.discount.discountValue
                        : (b.discount.discountValue / b.price) * 100;
                    
                    return bDiscount - aDiscount; // Higher discount first
                }
                
                return 0;
            });
            break;
        default:
            break;
    }
    setFilterProducts(fpCopy);
};

  // Categories based on Add.jsx
  const categories = [
    { value: "Men", label: "Men" },
    { value: "Women", label: "Women" },
    { value: "Bride And Groom", label: "Bride And Groom" },
    { value: "Lehenga", label: "Lehenga" },
    { value: "Kurti", label: "Kurti" },
    { value: "Saree", label: "Saree" },
    { value: "Onepiece", label: "Onepiece" }
  ];

  // Subcategories mapping based on Add.jsx
  const getSubCategories = (selectedCategory) => {
    switch(selectedCategory) {
      case "Lehenga":
        return [
          { value: "ALineLehenga", label: "A Line Lehenga" },
          { value: "StraightCutLehenga", label: "Straight Cut Lehenga" },
          { value: "BridalLehenga", label: "Bridal Lehenga" },
          { value: "PartyWearLehenga", label: "Party Wear Lehenga" },
          { value: "FlaredLehenga", label: "Flared Lehenga" },
          { value: "FishTail", label: "Fish Tail Lehenga" },
          { value: "NetLehenga", label: "Net Lehenga" },
          { value: "IndoWesternLehenga", label: "Indo Western Lehenga" },
          { value: "DesignerLehenga", label: "Designer Lehenga" },
          { value: "WesternLehenga", label: "Western Lehenga" }
        ];
      case "Kurti":
        return [
          { value: "ALineKurti", label: "A Line Kurti" },
          { value: "DesignerKurti", label: "Designer Kurti" },
          { value: "AnarkaliKurti", label: "Anarkali Kurti" },
          { value: "PartyWearKurti", label: "Party Wear Kurti" },
          { value: "KaftanKurti", label: "Kaftan Kurti" },
          { value: "DhotiKurti", label: "Dhoti Kurti" },
          { value: "IndoWesternKurti", label: "Indo Western Kurti" },
          { value: "WesternKurti", label: "Western Kurti" },
          { value: "ChikankariKurti", label: "Chikankari Kurti" },
          { value: "PrintedKurti", label: "Printed Kurti" },
          { value: "DenimKurti", label: "Denim Kurti" },
          { value: "JacketKurti", label: "Jacket Kurti" }
        ];
      // ... add other category subcategories similarly
      default:
        return [];
    }
  };

  // Add effect to refresh products on page visit
  useEffect(() => {
    const handleVisibilityChange = () => {
        if (!document.hidden) {
            refreshAllProducts();
        }
    };

    refreshAllProducts(); // Initial load
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      
      {/* Enhanced Filter Section */}
      <div className='min-w-60 space-y-6'>
        <div className="flex items-center justify-between">
          <p onClick={() => setShowFilter(!showFilter)} 
             className='text-xl font-semibold text-gray-700 flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors'>
            <HiFilter className="w-5 h-5"/>
            FILTERS
            <motion.img 
              className={`h-3 sm:hidden`}
              animate={{ rotate: showFilter ? 90 : 0 }} 
              src={assets.dropdown_icon} 
              alt="" 
            />
          </p>
        </div>

        <div className={`space-y-4 transition-all duration-300 ${showFilter ? '' : 'hidden'} sm:block`}>
          {/* Categories */}
          <div className="bg-white rounded-lg shadow-sm p-4 space-y-3 border border-gray-200">
            <h3 className='font-medium text-gray-800'>Categories</h3>
            <div className='space-y-2'>
              {categories.map((cat) => (
                <label key={cat.value} className='flex items-center gap-2 cursor-pointer group'>
                  <input
                    type="checkbox"
                    value={cat.value}
                    onChange={toggleCategory}
                    checked={category.includes(cat.value)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                    {cat.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Subcategories based on selected category */}
          {category.map((selectedCat) => {
            const subCats = getSubCategories(selectedCat);
            if (subCats.length > 0) {
              return (
                <div key={selectedCat} className="bg-white rounded-lg shadow-sm p-4 space-y-3 border border-gray-200">
                  <h3 className='font-medium text-gray-800'>{selectedCat} Types</h3>
                  <div className='space-y-2'>
                    {subCats.map((subCat) => (
                      <label key={subCat.value} className='flex items-center gap-2 cursor-pointer group'>
                        <input
                          type="checkbox"
                          value={subCat.value}
                          onChange={toggleType}
                          checked={productType.includes(subCat.value)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                          {subCat.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Right Side */}
      <div className='flex-1'>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            <div className='flex justify-between text-base sm:text-2xl mb-4'>
              <Title text1={'ALL'} text2={'COLLECTIONS'} />
              {/* Porduct Sort */}
              <select 
                onChange={(e) => setSortType(e.target.value)} 
                className='border-2 border-gray-300 text-sm px-2 py-1 rounded-lg hover:border-blue-500 transition-colors'
              >
                <option value="relevant">Sort by: Relevant</option>
                <option value="discounted">Sort by: Discounted</option>
                <option value="low-high">Sort by: Low to High</option>
                <option value="high-low">Sort by: High to Low</option>
              </select>
            </div>

            {/* Map Products */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
              {
                filterProducts.map((item, index) => (
                  <ProductItem 
                    key={item._id} // Use unique ID instead of index
                    id={item._id} 
                    name={item.name} 
                    price={item.price} 
                    image={item.image}
                    sizes={item.sizes}
                    discount={item.discount} // Add this line
                  />
                ))
              }
            </div>
          </>
        )}
      </div>

    </div>
  )
}

export default Collection
