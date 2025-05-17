import React, { useEffect, useState, useContext } from 'react';
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
        axios.get(`http://localhost:3001/getpostbyid/${id}`)
            .then(result => setPost(result.data))
            .catch(err => console.log(err));
    }, [id]);

    const handleDelete = () => {
        axios.delete(`http://localhost:3001/deletepost/${id}`)
            .then(() => {
                navigate('/'); // Redirect after deletion
            })
            .catch(err => console.log(err));
    };

    return (
        <div className="post-container">
            <img src={`http://localhost:3001/${post.file}`} alt='' />
            <h2>{post.title}</h2>
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