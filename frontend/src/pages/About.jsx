import React from 'react';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox';
import { motion } from 'framer-motion';

const About = () => {
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
      <motion.div variants={itemVariants} className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'} />
      </motion.div>

      <motion.div variants={itemVariants} className='my-10 flex flex-col md:flex-row gap-16'>
        <motion.div
          className="relative overflow-hidden rounded-xl shadow-xl md:max-w-[450px]"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <motion.img 
            className='w-full h-full object-cover' 
            src={assets.about_img} 
            alt="Rashi Fashion Studio"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </motion.div>

        <motion.div variants={itemVariants} className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
          <motion.p 
            className="leading-relaxed"
            variants={itemVariants}
          >
            Welcome to Rashi Fashion Studio, Nagpur's premier destination for exquisite ethnic wear and contemporary designs. Established in 2016 by the visionary entrepreneur <b className='text-gray-800 hover:text-teal-600 transition-colors'>Mr. Navratan Sharma</b>, Rashi Fashion Studio began with a humble yet ambitious dream.
          </motion.p>
          
          <motion.div variants={itemVariants} className="space-y-4">
            <b className='text-gray-800 text-xl font-semibold'>Our Mission</b>
            <p className="leading-relaxed">Our mission at R-studio is to empower customers with choice, convenience, and confidence. We're dedicated to providing a seamless shopping experience that exceeds expectations.</p>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className='text-xl py-8'>
        <Title text1={'WHY'} text2={'CHOOSE US'} />
      </motion.div>

      <motion.div 
        variants={containerVariants}
        className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-20'
      >
        {[
          {
            title: "Quality Assurance",
            description: "We meticulously select and vet each product to ensure it meets our stringent quality standards.",
            icon: "✨"
          },
          {
            title: "Convenience",
            description: "With our user-friendly interface and hassle-free ordering process, shopping has never been easier.",
            icon: "🛍️"
          },
          {
            title: "Exceptional Service",
            description: "Our team of dedicated professionals is here to assist you, ensuring your satisfaction is our top priority.",
            icon: "⭐"
          }
        ].map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="border rounded-xl p-8 hover:shadow-xl transition-all duration-300 bg-white hover:border-teal-200"
          >
            <span className="text-3xl mb-4 block">{feature.icon}</span>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <NewsletterBox />
      </motion.div>
    </motion.div>
  );
};

export default About;
