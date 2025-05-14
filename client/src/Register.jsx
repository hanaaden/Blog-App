import React from 'react';
import './register.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/register', { username, email, password })
      .then(res => console.log(res))
      .catch(err => console.log(err));
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2 className="register-title">Sign up</h2>
        <form onSubmit={handleSubmit} name="Form">
          <div className="register-input-group">
            <label className="register-label" htmlFor='username'>Username:</label>
            <input 
              className="register-input" 
              type='text' 
              id='username' 
              name='username' 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="register-input-group">
            <label className="register-label" htmlFor='email'>Email:</label>
            <input 
              className="register-input" 
              type='email' 
              id='email' 
              name='email' 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="register-input-group">
            <label className="register-label" htmlFor='password'>Password:</label>
            <input 
              className="register-input" 
              type='password' 
              id='password' 
              name='password' 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            <button className="register-button" type="submit">Sign up</button>
          </div>
        </form>
        <br />
        <p className="register-note">Already have an account?</p>
        <Link to='/login'>
          <button className="register-button">Login</button>
        </Link>
      </div>
    </div>
  );
}

export default Register;