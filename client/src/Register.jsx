import React, { useState } from 'react';
import './register.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('https://blog-app-c5fz.onrender.com/register', { username, email, password })
            .then(res => navigate('/login'))
            .catch(err => console.log(err));
    };

    return (
        <div className="register-container">
            <div className="register-form">
                <h2 className="register-title">Registration Form</h2>
                <form onSubmit={handleSubmit}>
                    <div className="register-input-group">
                        <label className="register-label" htmlFor='username'>Name</label>
                        <input className="register-input" type='text' id='username' name='username' onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div className="register-input-group">
                        <label className="register-label" htmlFor='email'>Email Address</label>
                        <input className="register-input" type='email' id='email' name='email' onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="register-input-group">
                        <label className="register-label" htmlFor='password'>Password</label>
                        <input className="register-input" type='password' id='password' name='password' onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button className="register-button" type="submit">Create Account</button>
                </form>
                <p className="register-note">Already have an account? <Link to="/login" className='signin'>Sign in</Link></p>
            </div>
        </div>
    );
}

export default Register;