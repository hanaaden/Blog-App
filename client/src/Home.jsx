// Home.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from './App';
import './home.css';

function Home() {
    const [posts, setPosts] = useState([]);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('https://blog-app-c5fz.onrender.com/getposts', { withCredentials: true })
            .then(response => {
                setPosts(response.data);
            })
            .catch(err => console.error("Error fetching posts:", err));
    }, []);

    const handleGetStarted = () => {
        if (user.email) {
            navigate('/create'); // Navigate to create post if logged in
        } else {
            navigate('/login'); // Navigate to login if not logged in
        }
    };

    return (
        <div className="home-container">
            <h1 className='welcome-title'>Welcome to Your Blog</h1>
            <p className='welcome-subtitle'>"Create and read amazing blogs. Share your thoughts with the world! This platform allows you to express your creativity, connect with others, and engage in meaningful discussions. Whether you're a seasoned writer or just starting out, your voice matters here."</p>
            <button className="get-started-button" onClick={handleGetStarted}>
                Get Started
            </button>
            <div className="container">
                {posts.length > 0 ? (
                    posts.map(post => (
                        <Link to={`/post/${post._id}`} key={post._id} className='post'>
                            {/* Check if post.file exists before rendering image */}
                            {post.file && (
                                <img
                                    src={`https://blog-app-c5fz.onrender.com${post.file}`} // Correctly build the image URL
                                    alt={post.title}
                                />
                            )}
                            <div className="post-text">
                                <h3>{post.title}</h3>
                                <p>Read more about {post.title} by clicking anywhere in the</p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className="no-posts-message">Loading..................</p>
                )}
            </div>
        </div>
    );
}

export default Home;