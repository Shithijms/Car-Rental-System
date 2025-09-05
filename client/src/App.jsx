import React, { useState } from "react"
import Navbar from './components/Navbar'
import { useLocation, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import CarDetails from "./pages/CarDetails";
import MyBooking from "./pages/MyBooking";

const App = () => {
const [showLogin, setShowLogin] = useState(false)
const isOwnerPath = useLocation().pathname.startsWith("/owner");


  return (
    <>
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/cars" element={<Cars/>}/>
          <Route path="/car-details/:id" element={<CarDetails />} />
          <Route path="/my-bookings" element={<MyBooking/>}/>
        </Routes>
    </>
  )
}
export default App;