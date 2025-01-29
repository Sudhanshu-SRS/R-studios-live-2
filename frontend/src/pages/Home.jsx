import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
import OurPolicy from "../components/OurPolicy";
import NewsletterBox from "../components/NewsletterBox";
import Slider from "../components/Slider";
import PopupVerify from "../components/PopupVerify";
import axios from "axios";
import { motion } from "framer-motion";

const Home = () => {
  const {
    userData,
    isVerified,
    showVerifyPopup,
    setShowVerifyPopup,
    handleClosePopup,
    backendUrl
  } = useContext(ShopContext);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2
      }
    }
  };

  const sectionVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Fetch images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendUrl}/api/images`);
        if (Array.isArray(res.data)) {
          setImages(res.data);
        } else {
          console.error("API response is not an array:", res.data);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [backendUrl]);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen"
    >
      {/* Show verification popup for unverified users */}
      {showVerifyPopup && !isVerified && (
        <PopupVerify onClose={handleClosePopup} />
      )}

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "linear" 
            }}
            className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <>
          <motion.div
            variants={sectionVariants}
            className="w-full"
          >
            <Slider images={images} />
          </motion.div>

          <motion.div
            variants={sectionVariants}
            className="mt-16"
          >
            <LatestCollection />
          </motion.div>

          <motion.div
            variants={sectionVariants}
            className="mt-16"
          >
            <BestSeller />
          </motion.div>

          <motion.div
            variants={sectionVariants}
            className="mt-16"
          >
            <OurPolicy />
          </motion.div>

          <motion.div
            variants={sectionVariants}
            className="mt-16 mb-8"
          >
            <NewsletterBox />
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default Home;
