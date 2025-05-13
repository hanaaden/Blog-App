import React from 'react';
import './register.css';
import { Link } from 'react-router-dom';

function Register() {
  return (
    <div className="register-container">
      <div className="register-form">
        <h2 className="register-title">Sign up</h2>
        <form>
          <div className="register-input-group">
            <label className="register-label" htmlFor='name'>Username:</label>
            <input className="register-input" type='text'/>
          </div>
          <div className="register-input-group">
            <label className="register-label" htmlFor='email'>Email:</label>
            <input className="register-input" type='email'/>
          </div>
          <div className="register-input-group">
            <label className="register-label" htmlFor='password'>Password:</label>
            <input className="register-input" type='password'/>
            <button className="register-button">Sign up</button>
          </div>
        </form>
        <br />
        <p className="register-note">Already have an account?</p>
        <Link to='/login'><button className="register-button">Login</button></Link>
      </div>
    </div>
  );
}

export default Register;