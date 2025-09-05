import React from 'react'
import Hero from '../components/Hero'
import FeaturedSection from '../components/FeaturedSection'
import Banner from '../components/Banner' // <-- Import Banner

const Home = () => {
  return (
    <>
      <Hero />
      <FeaturedSection />
      <Banner /> {/* <-- Add Banner here */}
    </>
  )
}

export default Home