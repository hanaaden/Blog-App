import React from 'react';
import Navbar from './Navbar'; // Ensure the path is correct
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './Register'; // Import your Register component
import Login from './login'; // Ensure this matches the file name exactly

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/Login" element={<Login />} /> {/* Ensure this path matches the case */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;