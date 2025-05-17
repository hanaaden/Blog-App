import React, { createContext, useEffect, useState } from 'react';
import Navbar from './Navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Home from './Home';
import CreatePost from './CreatePost';
import ContactUs from './ContactUs';
import Post from './Post';
import EditPost from './EditPost';
import axios from 'axios';

export const UserContext = createContext();

function App() {
    const [user, setUser] = useState({});

    axios.defaults.withCredentials = true;

    useEffect(() => {
        axios.get('http://localhost:3001/')
            .then(response => {
                setUser(response.data);
            })
            .catch(err => console.log(err));
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            <BrowserRouter>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/create" element={<CreatePost />} />
                    <Route path="/contactus" element={<ContactUs />} />
                    <Route path="/post/:id" element={<Post />} />
                    <Route path="/editpost/:id" element={<EditPost />} />
                </Routes>
            </BrowserRouter>
        </UserContext.Provider>
    );
}

export default App;