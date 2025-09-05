import React from 'react'
import Hero from '../components/Hero'
import FeaturedSection from '../components/FeaturedSection'
import Banner from '../components/Banner' // <-- Import Banner
import Footer from '../components/Footer'

const Home = () => {
  return (
    <>
      <Hero />
      <FeaturedSection />
      <Banner /> {/* <-- Add Banner here */}
      <Footer />
    </>
  )
}

export default Home