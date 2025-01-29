import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const PageRefresh = () => {
  const location = useLocation();
  const [lastPath, setLastPath] = useState(location.pathname);
  const [isLoading, setIsLoading] = useState(false);

  // Memoize scroll function
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  useEffect(() => {
    const excludedPaths = ['/product/', '/cart', '/place-order'];
    const isExcludedPath = excludedPaths.some(path => location.pathname.includes(path));

    if (location.pathname !== lastPath && !isExcludedPath) {
      // Set loading immediately before any content is shown
      setIsLoading(true);
      scrollToTop();
      
      // Check if this is a new navigation
      if (!sessionStorage.getItem(`visited-${location.pathname}`)) {
        sessionStorage.setItem(`visited-${location.pathname}`, 'true');
        // Immediate reload instead of setTimeout
        window.location.reload();
      }
      
      setLastPath(location.pathname);
    } else {
      scrollToTop();
    }

    return () => {
      setIsLoading(false);
    };
  }, [location.pathname, lastPath, scrollToTop]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="bg-white p-4 rounded-full shadow-lg"
          >
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageRefresh;