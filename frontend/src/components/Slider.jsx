import React from 'react'
import { assets } from '../assets/assets'
const Slider = () => {
    return (
        <div className='h-[800px] flex flex-col sm:flex-row  mb-8 '>
                <img src={assets.Slider} className="w-full h-full transition-all duration-300 rounded-lg cursor-pointer filter grayscale hover:grayscale-0 " alt="" />
        </div>
    )
}

export default Slider