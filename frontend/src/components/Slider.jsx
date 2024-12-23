
import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import Title from './Title';

const Slider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToIndex = (index) => {
    setCurrentIndex(index);
  };

  const handlers = useSwipeable({
    onSwipedLeft: goToNext,
    onSwipedRight: goToPrevious,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true, // Enable mouse tracking for swipe
  });

  if (!Array.isArray(images)) {
    return <div>Error: Images data is not an array</div>;
  }

  return (
    <div className='relative h-[800px] flex flex-col items-center justify-center mb-8 group' {...handlers}>
      <div className="text-center py-8 text-3xl">
      <Title text1={"WHAT'S"} text2={"YOUR VIBE"} />
      {/* <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Choose Your Divine Look
        </p> */}
        </div>
        
      <div className='overflow-hidden w-full h-full'>
        <div
          className='flex transition-transform duration-1000 ease-in-out'
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <img
              key={index}
              src={image.url}
              className='w-full h-full object-cover'
              alt={`Slide ${index}`}
            />
          ))}
        </div>
      </div>
      <div className='absolute inset-0 flex justify-between items-center'>
        <div className='w-1/2 h-full flex items-center justify-start hover:bg-transparent'>
          <button
            onClick={goToPrevious}
            className='bg-gray-800 text-white px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300'
          >
            &#9664; {/* Left arrow */}
          </button>
        </div>
        <div className='w-1/2 h-full flex items-center justify-end hover:bg-transparent'>
          <button
            onClick={goToNext}
            className='bg-gray-800 text-white px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300'
          >
            &#9654; {/* Right arrow */}
          </button>
        </div>
      </div>
      <div className='absolute bottom-4 flex justify-center w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
        {images.map((_, index) => (
          <div
            key={index}
            onClick={() => goToIndex(index)}
            className={`w-3 h-3 mx-1 rounded-full cursor-pointer ${index === currentIndex ? 'bg-gray-800' : 'bg-gray-400'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;

