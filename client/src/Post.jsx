// Post.jsx
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from './App';
import './post.css';

function Post() {
    const { id } = useParams();
    const [post, setPost] = useState({});
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    useEffect(() => {
        axios.get(`https://blog-app-c5fz.onrender.com/getpostbyid/${id}`, { withCredentials: true })
            .then(result => setPost(result.data))
            .catch(err => console.log(err));
    }, [id]);

    const handleDelete = () => {
        // You might want to add a confirmation dialog here
        if (user.email) {
            axios.delete(`https://blog-app-c5fz.onrender.com/deletepost/${id}`, { withCredentials: true })
                .then(() => {
                    navigate('/');
                })
                .catch(err => {
                    console.error("Error deleting post:", err);
                    alert("Failed to delete post. Please ensure you are logged in as the owner.");
                });
        } else {
            alert("You need to be logged in to delete this post.");
        }
    };

    return (
        <div className="post-container">
            <h2>{post.title}</h2>
            {/* Ensure post.file exists before trying to render the image */}
            {post.file && (
                <img
                    src={`${post.file}`} // Use the base URL + relative path
                    alt={post.title}
                />
            )}
            <p>{post.description}</p>
            {user.email === post.email && (
                <div className='buttons'>
                    {/* Make sure /editpost/:id route exists and is correctly handled */}
                    <Link to={`/editpost/${post._id}`}><button>Edit</button></Link>
                    <button onClick={handleDelete}>Delete</button>
                </div>
            )}
        </div>
    );
}

export default Post;
