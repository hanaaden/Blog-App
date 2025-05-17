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
        axios.get(`http://localhost:3001/getpostbyid/${id}`)
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
        axios.put(`http://localhost:3001/editpost/${id}`, { title, description })
            .then(res => {
                if (res.data === "Success") {
                    navigate('/'); // Navigate to home after successful update
                }
            })
            .catch(err => console.log(err));
    };

    return (
        <div className="create-post-container">
            <form onSubmit={handleSubmit}>
                <input type='text' value={title} onChange={e => setTitle(e.target.value)} required />
                <textarea value={description} onChange={e => setDescription(e.target.value)} required></textarea>
                <button type="submit">Update Post</button>
            </form>
        </div>
    );
}

export default EditPost;