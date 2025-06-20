// import React, { createContext, useEffect, useState } from 'react';
// import Navbar from './Navbar';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Register from './Register';
// import Login from './login';
// import Home from './Home';
// import CreatePost from './CreatePost';
// import Post from './Post';
// import EditPost from './EditPost';
// import ContactUs from './ContactUs'; // Import the ContactUs component
// import axios from 'axios';
// import HamburgerMenu from './HamburgerMenu';

// // https://blog-app-c5fz.onrender.com

// export const UserContext = createContext();

// function App() {
//     // const [user, setUser] = useState({});
//     const [user, setUser] = useState(null);

//     axios.defaults.withCredentials = true;

//     useEffect(() => {
//         axios.get('https://blog-app-c5fz.onrender.com/', { withCredentials: true })
//             .then(response => {
//                 setUser(response.data);
//             })
//             .catch(err => console.log(err));
//     }, []);

//     const handleLogout = () => {
//         axios.get('https://blog-app-c5fz.onrender.com/logout', { withCredentials: true })
//             .then(res => {
//                 if (res.data === "success") {
//                     setUser({});
//                 }
//             })
//             .catch(err => console.log(err));
//     };

//     return (
//         <UserContext.Provider value={{ user, setUser }}>
//             <BrowserRouter>
//                 <Navbar />
//                 <HamburgerMenu user={user} onLogout={handleLogout} />
//                 <Routes>
//                     <Route path="/" element={<Home />} />
//                     <Route path="/register" element={<Register />} />
//                     <Route path="/login" element={<Login />} />
//                     <Route path="/create" element={<CreatePost />} />
//                     <Route path="/post/:id" element={<Post />} />
//                     <Route path="/editpost/:id" element={<EditPost />} />
//                     <Route path="/contactus" element={<ContactUs />} /> {/* Add this route */}
//                 </Routes>
//             </BrowserRouter>
//         </UserContext.Provider>
//     );
// }

// export default App;





import React, { createContext, useEffect, useState } from 'react';
import Navbar from './Navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './Register';
import Login from './login';
import Home from './Home';
import CreatePost from './CreatePost';
import Post from './Post';
import EditPost from './EditPost';
import ContactUs from './ContactUs';
import axios from 'axios';
import HamburgerMenu from './HamburgerMenu';

export const UserContext = createContext();

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    axios.defaults.withCredentials = true;

    useEffect(() => {
        axios.get('https://blog-app-c5fz.onrender.com/', { withCredentials: true })
            .then(response => {
                setUser(response.data);
            })
            .catch(err => {
                console.log(err);
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleLogout = () => {
        axios.get('https://blog-app-c5fz.onrender.com/logout', { withCredentials: true })
            .then(res => {
                if (res.data === "success") {
                    setUser(null);
                }
            })
            .catch(err => console.log(err));
    };

    if (loading) return <div>Loading...</div>; // You can replace this with a loader spinner if you prefer

    return (
        <UserContext.Provider value={{ user, setUser }}>
            <BrowserRouter>
                <Navbar />
                <HamburgerMenu user={user} onLogout={handleLogout} />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/create" element={<CreatePost />} />
                    <Route path="/post/:id" element={<Post />} />
                    <Route path="/editpost/:id" element={<EditPost />} />
                    <Route path="/contactus" element={<ContactUs />} />
                </Routes>
            </BrowserRouter>
        </UserContext.Provider>
    );
}

export default App;
