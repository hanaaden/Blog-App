import React, { useState } from 'react';
import './login.css'; // New CSS file for Login styles
import { Link,useNavigate } from 'react-router-dom';
import axios from 'axios';



function Login() {
  
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate= useNavigate();
  
    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3001/login', { email, password }, { withCredentials: true }) // Add withCredentials
            .then(res => {
  if(res.data=="success"){
               navigate('/')
              }
            }
            
            )
            .catch(err => console.log(err));
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2 className="login-title">WELCOME BACK</h2>
                <form onSubmit={handleSubmit}>
                    <div className="login-input-group">
                        <label className="login-label" htmlFor='email'>Email:</label>
                        <input className="login-input" type='email' onChange={e => setEmail(e.target.value)} name='email' />
                    </div>
                    <div className="login-input-group">
                        <label className="login-label" htmlFor='password'>Password:</label>
                        <input className="login-input" type='password' name='password' onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button className="login-button">Login</button>
                </form>
                <br />
                <p className="login-note">Don't have an account?</p>
                <Link to='/register'>
                    <button className="login-button">Sign up</button>
                </Link>
            </div>
        </div>
    );
}

export default Login;