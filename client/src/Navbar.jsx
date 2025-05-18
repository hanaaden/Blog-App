import React, { useContext } from 'react';
import './style.css';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from './App';
import axios from 'axios';

function Navbar() {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        axios.get('https://blog-app-c5fz.onrender.com/logout', { withCredentials: true })
            .then(res => {
                if (res.data === "success") {
                    setUser({});
                    navigate('/');
                }
            })
            .catch(err => console.log(err));
    };

    return (
        <div className='navbar-header'>
            <h3>Blog App</h3>
            <div className="navbar-links">
                <Link to='/' className='link'>Home</Link>
                {user.username && <Link to='/create' className='link'>Create</Link>}
                <Link to="/contactus" className='link'>Contact Us</Link>
            </div>
            {user.username ? (
                <div>
                    <input type="button" value="Logout" onClick={handleLogout} className='btn_input' />
                </div>
            ) : (
                <h5><Link to="/register" className='link'>Register/Login</Link></h5>
            )}
        </div>
    );
}

export default Navbar;