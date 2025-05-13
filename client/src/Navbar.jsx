import React from 'react';
import './style.css';
import {Link} from 'react-router-dom'
function Navbar() {
  return (
    <div className='navbar-header'>
      <h3>Blog App</h3>
      <div>
        <a href='#' className='link'>Home</a>
        <a href='#' className='link'>Create</a>
        <a href='#' className='link'>Contact</a>
      </div>
      <h5><Link to="/register" className='link'> Register/Login</Link></h5>
    </div>
  );
}

export default Navbar;
