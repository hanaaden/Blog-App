import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './hamburger.css';

function HamburgerMenu({ user, onLogout }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="hamburger-menu">
            <button className="hamburger-icon" onClick={toggleMenu}>
                ☰
            </button>
            {isOpen && (
                <div className="menu">
                    <Link to="/" onClick={toggleMenu}>Home</Link>
                    <Link to="/create" onClick={toggleMenu}>Create Post</Link>
                    <Link to="/contactus" onClick={toggleMenu}>Contact Us</Link>
                    {user.username ? (
                        <Link to="/" onClick={() => { onLogout(); toggleMenu(); }}>Logout</Link>
                    ) : (
                        <>
                            <Link to="/login" onClick={toggleMenu}>Login</Link>
                            <Link to="/register" onClick={toggleMenu}>Register</Link>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default HamburgerMenu;