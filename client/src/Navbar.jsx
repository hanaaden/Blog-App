import React, { useContext } from 'react';
import './style.css';
import { Link, useNavigate } from 'react-router-dom';
import { userContext } from './App';
import axios from 'axios';


function Navbar() {
  
  const user = useContext(userContext); // Correctly use useContext to access the context
  const navigate=useNavigate()
  const handleLogout = ()=>{
    axios.get('http://localhost:3001/logout')
    .then(res=>{
      if(res.data === "success"){
        setUser({}); // Clear user context on logout
        navigate('/');
      }
    }).catch(err=>console.log(err))
  }

  return (
    <div className='navbar-header'>
      <h3>Blog App</h3>
      <div>
        <a href='#' className='link'>Home</a>
        <a href='#' className='link'>Create</a>
        <a href='#' className='link'>Contact</a>
      </div>
      {user.username ? (
        <div>
          <input type="button" value="Logout" onClick={handleLogout} className='btn_input' />
        </div>
      ) : (
        <h5><Link to="/register" className='link'> Register/Login</Link></h5>
      )}
    </div>
  );
}

export default Navbar;