import React, { useContext, useState } from 'react';
import './login.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from './App'; // Import UserContext

function Login() {
  const { setUser } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/login', { email, password }, { withCredentials: true })
      .then(res => {
        if (res.data === "success") {
          // Assuming you can get user details from the response
          setUser({ email, username: email }); // Update with actual user data if available
          navigate('/');
        }
      })
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