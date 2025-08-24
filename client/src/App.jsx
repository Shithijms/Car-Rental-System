import React, { useState } from "react"
import Navbar from './components/Navbar'
import { useLocation } from "react-router-dom";

const App = () => {
const [showLogin, setShowLogin] = useState(false)
const isOwnerPath = useLocation().pathname.startsWith("/owner");


  return (
    <>
        <Navbar setShowlogin={setShowLogin}/>
    </>
  )
}
export default App;