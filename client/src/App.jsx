import React, { createContext, useEffect, useState } from 'react';
import Navbar from './Navbar'; // Ensure the path is correct
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './Register'; // Import your Register component
import Login from './login'; // Ensure this matches the file name exactly
import Home from './home';
import axios from 'axios';



export const userContext=createContext()
function App() {
   const [user,setUser]=useState({})

  axios.defaults.withCredentials=true;
  useEffect(()=>{
axios.get('http://localhost:3001/')
.then(user=>{
  setUser(user.data)
})
.catch(err=>console.log(err))
  },[])
  return (
    <userContext.Provider value={user}>

    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/Login" element={<Login />} /> {/* Ensure this path matches the case */}
        <Route path="/" element={<Home />} /> {/* Ensure this path matches the case */}
        
      </Routes>
    </BrowserRouter>
    </userContext.Provider>
  );
}

export default App;