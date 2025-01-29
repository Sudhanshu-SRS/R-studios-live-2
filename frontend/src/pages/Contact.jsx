import React from 'react';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox';
import { motion } from 'framer-motion';

const Contact = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <motion.div variants={itemVariants} className='text-center text-2xl pt-10 border-t'>
        <Title text1={'CONTACT'} text2={'US'} />
      </motion.div>

      <motion.div variants={itemVariants} className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28'>
        <motion.div 
          className="relative overflow-hidden rounded-xl shadow-xl"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <motion.img 
            className='w-full md:max-w-[480px] object-cover' 
            src={assets.contact_img} 
            alt="Our Store"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </motion.div>

        <motion.div variants={itemVariants} className='flex flex-col justify-center items-start gap-6 md:w-1/2'>
          <motion.div whileHover={{ x: 5 }} className="space-y-2">
            <h2 className='font-semibold text-2xl text-gray-800'>Our Store</h2>
            <div className='text-gray-600 space-y-1 hover:text-gray-800 transition-colors'>
              <p>GB-Floor, Manorama Tower</p>
              <p>Bharat Mata Square, Itwari</p>
              <p>Nagpur - 440002</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ x: 5 }} className="space-y-2">
            <h3 className='font-medium text-lg text-gray-700'>Contact Details</h3>
            <div className='text-gray-600 space-y-1 hover:text-gray-800 transition-colors'>
              <p className="flex items-center gap-2">
                <span className="text-teal-500">📞</span>
                (+91) 9764804422
              </p>
              <p className="flex items-center gap-2">
                <span className="text-teal-500">✉️</span>
                RashiFashionOffice@gmail.com
              </p>
            </div>
          </motion.div>

          <motion.div whileHover={{ x: 5 }} className="space-y-2">
            <h2 className='font-semibold text-2xl text-gray-800'>Careers at R-Studio</h2>
            <p className='text-gray-600'>Learn more about our teams and job openings.</p>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: '#000000', color: '#ffffff' }}
              whileTap={{ scale: 0.95 }}
              className='border-2 border-black px-8 py-4 text-sm font-medium rounded-lg shadow-md hover:shadow-xl transition-all duration-300'
            >
              Explore Jobs
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <NewsletterBox />
      </motion.div>
    </motion.div>
  );
};

export default Contact;
