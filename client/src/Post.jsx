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
        axios.get(`http://localhost:3001/getpostbyid/${id}`, { withCredentials: true })
            .then(result => setPost(result.data))
            .catch(err => console.log(err));
    }, [id]);

    const handleDelete = () => {
        if (user.email) {
            axios.delete(`http://localhost:3001/deletepost/${id}`, { withCredentials: true })
                .then(() => {
                    navigate('/'); 
                })
                .catch(err => console.log(err));
        } else {
            alert("You need to be logged in to delete this post.");
        }
    };

    return (
        <div className="post-container">
            <h2>{post.title}</h2>
            <img src={`http://localhost:3001/${post.file}`} alt={post.title} />
            <p>{post.description}</p>
            {user.email === post.email && (
                <div className='buttons'>
                    <Link to={`/editpost/${post._id}`}><button>Edit</button></Link>
                    <button onClick={handleDelete}>Delete</button>
                </div>
            )}
        </div>
    );
}

export default Post;