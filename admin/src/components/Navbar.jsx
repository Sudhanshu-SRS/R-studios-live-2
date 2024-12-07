import React from 'react'
import {assets} from '../assets/assets'

const Navbar = ({setToken}) => {
  return (
    <div className='flex items-center py-2 px-[4%] justify-between bg-gray-500'>
        <img className='w-20 hover:scale-110 hover:gloer ' src={assets.logo} alt="" />
        <button onClick={()=>setToken('')} className='bg-red-500 hover:bg-gray-800 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm'>Logout</button>
    </div>
  )
}

export default Navbar