import React, { useState, useEffect, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import Title from './Title';

const Slider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const imageRef = useRef(null);

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!paused) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 4000); // Change image every 4 seconds
      return () => clearInterval(interval);
    }
  }, [images.length, paused]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToIndex = (index) => {
    setCurrentIndex(index);
  };

  // Enhanced swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: goToNext,
    onSwipedRight: goToPrevious,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true, // Enable mouse swipe
    trackTouch: true, // Enable touch swipe
    delta: 50, // Minimum swipe distance
    swipeDuration: 500, // Maximum time for swipe gesture
  });

  if (!Array.isArray(images)) {
    return <div>Error: Images data is not an array</div>;
  }

  return (
    <div
      className='relative w-full  overflow-hidden group'
      {...handlers} // Apply swipe handlers
      onMouseEnter={() => {
        setPaused(true);
        setIsHovering(true);
      }}
      onMouseLeave={() => {
        setPaused(false);
        setIsHovering(false);
      }}
    >
      <div className="text-center py-8 text-3xl">
        <Title text1={"WHAT'S"} text2={"YOUR VIBE"} />
      </div>

      {/* Slider Image Container */}
      <div className='relative w-full h-full'>
        <div
          className='flex transition-transform duration-700 ease-in-out'
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className='w-full flex-shrink-0 relative'>
              <img
                src={image.url}
                className='w-full h-full object-cover'
                alt={`Slide ${index}`}
              />
              {/* Gradient Overlay for text */}
              <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black to-transparent text-white flex items-end p-4">
                <p className="text-lg font-medium">Slide {index + 1}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Move navigation buttons inside the image container */}
        <div className='absolute top-1/2 -translate-y-1/2 left-0 right-0 flex items-center justify-between px-8 pointer-events-none'>
          <button
            onClick={goToPrevious}
            className={`
              pointer-events-auto
              ${isHovering ? 'opacity-100' : 'opacity-0'}
              transition-all duration-500 ease-in-out
              bg-white/20 backdrop-blur-md 
              hover:bg-white/30
              text-white w-12 h-12
              rounded-full shadow-lg 
              flex items-center justify-center
              hover:scale-110 hover:shadow-2xl
              border border-white/30
              group
            `}
            aria-label="Previous slide"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 transform transition-transform group-hover:-translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToNext}
            className={`
              pointer-events-auto
              ${isHovering ? 'opacity-100' : 'opacity-0'}
              transition-all duration-500 ease-in-out
              bg-white/20 backdrop-blur-md 
              hover:bg-white/30
              text-white w-12 h-12
              rounded-full shadow-lg 
              flex items-center justify-center
              hover:scale-110 hover:shadow-2xl
              border border-white/30
              group
            `}
            aria-label="Next slide"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 transform transition-transform group-hover:translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className='absolute bottom-6 flex justify-center w-full gap-2'>
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToIndex(index)}
            className={`
              w-2.5 h-2.5 rounded-full 
              transition-all duration-300 ease-in-out
              ${index === currentIndex ? 
                'bg-white w-8 scale-110 shadow-white/50 shadow-lg' : 
                'bg-white/50 hover:bg-white/80'}
            `}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;
