import React, { useState } from 'react'
import { assets, cityList } from '../assets/assets'

const Hero = () => {

    const [pickupLocation, setPickupLocation] = useState('')
  return (
    <div className='h-screen flex flex-col items-center justify-center gap-14 bg-light text-center '>
        <h1 className='text-4xl md:text-6xl font-semibold'>Luxury cars on rent</h1>

        <form className='flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-lg md:rounded-full w-full max-w-80 md:max-w-200 bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.05)]'>
            <div className='flex flex-col md:flex-row items-start md:items-center gap-10 md:ml-8'>
                <div className='flex flex-col items-start gap-2' >
                    <select required value ={pickupLocation} onChange={(e)=>setPickupLocation(e.target.value)}>
                        <option value="">pickup Location</option>
                        {cityList.map((city)=> <option key={city} value={city}>{city}</option>)}
                    </select>
                    <p className ='px-1 text-sm text-gray-500'>{pickupLocation?
                    pickupLocation: 'Please select  location'}</p>
                </div>
            </div>

            <div className='flex flex-col md:flex-row items-start md:items-center gap-10 md:ml-8'>
                <label htmlFor="pickup-Date">Pickup Date</label>
                <input type="date" id='pickup-Date' min={new Date().toISOString().split('T')[0]} className='text-sm text-gray-500   ' required/>
            </div>

            <div className='flex flex-col md:flex-row items-start md:items-center gap-10 md:ml-8'>
                <label htmlFor="Return-Date">Return Date</label>
                <input type="date" id='Return-Date' min={new Date().toISOString().split('T')[0]} className='text-sm text-gray-500   ' required/>
            </div>

            <button className='flex items-center justify-center gap-1 px-9 py-3 max-sm:mt-4 bg-primary hover:bg-primary-dull text-white rounded-full cursor-pointer'>
                <img src={assets.search_icon} alt='search-icon'></img>
                <lable className='text-sm text-gray-500'>Search</lable>
            </button>


        </form>
        <img src={assets.main_car} alt="hero" className='max-h-74'/>
    </div>
  )
}

export default Hero