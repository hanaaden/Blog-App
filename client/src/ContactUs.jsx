import React, { useState } from 'react';
import './contact.css'; // Make sure to import the CSS file
import axios from 'axios';

function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const contactData = { name, email, message };

    axios.post('http://localhost:3001/contact', contactData, { withCredentials: true })
      .then(res => {
        if (res.data === "Message sent successfully") {
          console.log(res.data); // Handle success
        }
      })
      .catch(err => console.log(err)); // Handle errors
  }

  return (
    <div className="contact-container">
      <div className="contact-form">
        <h2 className="contact-title">Contact Us</h2>
        <form onSubmit={handleSubmit}>
          <div className="contact-input-group">
            <label className="contact-label" htmlFor="name">Name</label>
            <input type='text' id="name" className="contact-input" placeholder='Your Name' onChange={e => setName(e.target.value)} />
          </div>
          <div className="contact-input-group">
            <label className="contact-label" htmlFor="email">Email</label>
            <input type='email' id="email" className="contact-input" placeholder='Your Email' onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="contact-input-group">
            <label className="contact-label" htmlFor="message">Message</label>
            <textarea name="message" id="message" className="contact-textarea" cols={30} rows={10} placeholder='Your Message' onChange={e => setMessage(e.target.value)}></textarea>
          </div>
          <button type="submit" className="contact-button">Send Message</button>
        </form>
      </div>
    </div>
  );
}

export default ContactUs;