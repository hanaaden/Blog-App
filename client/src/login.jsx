import React from 'react';
import './login.css'; // New CSS file for Login styles
import { Link } from 'react-router-dom';

function Login() {
  return (
    <div className="login-container">
      <div className="login-form">
        <h2 className="login-title">Login</h2>
        <form>
          <div className="login-input-group">
            <label className="login-label" htmlFor='email'>Email:</label>
            <input className="login-input" type='email' />
          </div>
          <div className="login-input-group">
            <label className="login-label" htmlFor='password'>Password:</label>
            <input className="login-input" type='password' />
            <button className="login-button">Login</button>
          </div>
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