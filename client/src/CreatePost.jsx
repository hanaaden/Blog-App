import React, { useContext, useState } from 'react';
import axios from 'axios';
import { UserContext } from './App';
import { useNavigate } from 'react-router-dom';
import './create.css';

function CreatePost() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('email', user.email);
        formData.append('file', file);

        axios.post('https://blog-app-c5fz.onrender.com/create', formData, { withCredentials: true })
            .then(res => {
                if (res.data === "File uploaded successfully") {
                    // Redirect to home page after successful post creation
                    navigate('/');
                }
            })
            .catch(err => console.log(err));
    };

    return (
        <div className="create-post-container">
            <form onSubmit={handleSubmit} className="create-post-form">
                <h2 className="create-post-title">Create a New Post</h2>
                <div className="create-post-input-group">
                    <label className="create-post-label">Title</label>
                    <input
                        type="text"
                        className="create-post-input"
                        placeholder="Title"
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="create-post-input-group">
                    <label className="create-post-label">Description</label>
                    <textarea
                        className="create-post-textarea"
                        placeholder="Description"
                        onChange={e => setDescription(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div className="create-post-input-group">
                    <label className="create-post-label">Upload Image</label>
                    <input
                        type="file"
                        className="create-post-file-input"
                        onChange={e => setFile(e.target.files[0])}
                        required
                    />
                </div>
                <button type="submit" className="create-post-button">Create Post</button>
                <p className="create-post-note">Your post will be available after creation.</p>
            </form>
        </div>
    );
}

export default CreatePost;