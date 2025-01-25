import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
// import Hero from "../components/Hero";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
import OurPolicy from "../components/OurPolicy";
import NewsletterBox from "../components/NewsletterBox";
import Slider from "../components/Slider";
import PopupVerify from "../components/PopupVerify";
import axios from "axios";

const Home = () => {
  const {
    userData,
    isVerified,
    showVerifyPopup,
    setShowVerifyPopup,
    handleClosePopup, // Access setter from context
    backendUrl // Add this from context
  } = useContext(ShopContext);

  const [images, setImages] = useState([]);

  // Fetch images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/images`);
        if (Array.isArray(res.data)) {
          setImages(res.data);
        } else {
          console.error("API response is not an array:", res.data);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, [backendUrl]); // Add backendUrl to dependencies

  return (
    <div>
      {/* Show verification popup for unverified users */}
      {showVerifyPopup && !isVerified && (
        <PopupVerify onClose={handleClosePopup} />
      )}

      <Slider images={images} />
      <LatestCollection />
      <BestSeller />
      <OurPolicy />
      <NewsletterBox />
    </div>
  );
};

export default Home;
