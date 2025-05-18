import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './create.css';

function EditPost() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`https://blog-app-c5fz.onrender.com/getpostbyid/${id}`)
            .then(result => {
                if (result.data) {
                    setTitle(result.data.title);
                    setDescription(result.data.description);
                }
            })
            .catch(err => console.log(err));
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.put(`https://blog-app-c5fz.onrender.com/editpost/${id}`, { title, description })
            .then(res => {
                if (res.data === "Success") {
                    navigate('/'); 
                }
            })
            .catch(err => console.log(err));
    };

    return (
        <div className="create-post-container">
            <form onSubmit={handleSubmit} className="create-post-form">
                <h2 className="create-post-title">Edit Your Post</h2>
                <div className="create-post-input-group">
                    <label className="create-post-label">Title</label>
                    <input
                        type='text'
                        className="create-post-input"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="create-post-input-group">
                    <label className="create-post-label">Description</label>
                    <textarea
                        className="create-post-textarea"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                    ></textarea>
                </div>
                <button type="submit" className="create-post-button">Update Post</button>
            </form>
        </div>
    );
}

export default EditPost;