import React from 'react'
import { assets } from '../assets/assets'

const CarCard = ({ car }) => {
    const currency = import.meta.env.VITE_CURRENCY || '₹'

    return (
        <div className='group rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-all duration-500 cursor-pointer'>

            <div className='relative h-48 overflow-hidden'>
                <img src={car.image} alt="car image" className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'></img>

                {car.isAvailable && <p className='absolute top-4 left-4 bg-primary/90 text-white text-xs px-2.5 py-1 rounded-full'>Available Now</p>}

                <div className='absolute top-4 right-4 bg-primary/90 text-white text-xs px-2.5 py-1 rounded-full'>
                    <span className='font-semibold'>{currency}{car.pricePerDay}</span>
                    <span className='text-sm text-white/80'> / day</span>
                </div>
            </div>

            <div className='p-4 sm:p-5'>
                <div className='flex justify-between items-start mb-2'>
                    <div>
                        <h3 className='text-lg font-medium'>{car.brand} {car.model}</h3>
                        <p className='text-muted-foreground text-sm'>{car.category} • {car.year}</p>
                    </div>
                </div>

                <div className='mt-4 grid grid-cols-2 gap-y-2 text-gray-600'>
                    <div className='flex items-center text-sm text-muted-foreground'>
                        <img src={assets.users_icon} alt="" className='h-4 mr-2'/>
                        <span>{car.seating_capacity} seats</span>
                    </div>
                    <div className='flex items-center text-sm text-muted-foreground'>
                        <img src={assets.fuel_icon} alt="" className='h-4 mr-2'/>
                        <span>{car.fuel_type} </span>
                    </div>
                    <div className='flex items-center text-sm text-muted-foreground'>
                        <img src={assets.car_icon} alt="" className='h-4 mr-2'/>
                        <span>{car.transmission} </span>
                    </div>
                    <div className='flex items-center text-sm text-muted-foreground'>
                        <img src={assets.location_icon} alt="" className='h-4 mr-2'/>
                        <span>{car.location} </span>
                    </div>

                </div>


                {/* <hr className='border-borderColor my-6' />

                <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                    {[
                        { icon: assets.user_icon, text: `${car.seating_capacity} seats` },
                        { icon: assets.fuel_icon, text: car.fuel_type },
                        { icon: assets.car_icon, text: car.transmission },
                        { icon: assets.location_icon, text: car.location }
                    ].map(({ icon, text }) => (
                        <div key={text} className='flex flex-col items-center bg-light p-4 rounded-lg'>
                            <img src={icon} alt="icon" className='h-5 mb-2' />
                            {text}
                        </div>
                    ))}
                </div>

                {/* description */}
                {/* <div>
                    <h1 className='text-xl font-medium mb-3'>Description</h1>
                    <p className='text-gray-500'>{car.description}</p>
                </div> */}

                {/* features */}
                {/* <div>
                    <h1 className='text-xl font-medium mb-3'>Features</h1>
                    <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                        {
                            ["360 Camera ","Bluetooth","GPS","heated Seats","RearView Mirror"].map((item)=>(
                                <li key={item} className='flex-item-center text-grey-500'>
                                    <img src={assets.check_icon} alt="check-icon" className='w-4 mr-2' />
                                    {item}
                                </li>

                                
                            ))
                        }
                        

                        
                    </ul>
                </div> */} 
            </div>
        </div>
    )
}

export default CarCard
