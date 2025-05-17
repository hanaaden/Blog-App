import React, { useContext, useState } from 'react';
import axios from 'axios';
import { UserContext } from './App';
import './create.css';

function CreatePost() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const { user } = useContext(UserContext);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('email', user.email); // Send user email
        formData.append('file', file);

        axios.post('http://localhost:3001/create', formData, { withCredentials: true })
            .then(res => {
                if (res.data === "File uploaded successfully") {
                    console.log(res.data);
                }
            })
            .catch(err => console.log(err));
    };

    return (
        <div className="create-post-container">
            <form onSubmit={handleSubmit}>
                <input type='text' placeholder='Title' onChange={e => setTitle(e.target.value)} required />
                <textarea placeholder='Description' onChange={e => setDescription(e.target.value)} required></textarea>
                <input type='file' onChange={e => setFile(e.target.files[0])} required />
                <button type="submit">Create Post</button>
            </form>
        </div>
    );
}

export default CreatePost;