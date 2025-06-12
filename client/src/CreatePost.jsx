// CreatePost.jsx
import React, { useContext, useState } from 'react';
import axios from 'axios';
import { UserContext } from './App';
import { useNavigate } from 'react-router-dom';
import './create.css';

function CreatePost() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    // const [file, setFile] = useState(null);
    // const [fileUrl, setFileUrl] = useState('');
    const [fileBase64, setFileBase64] = useState('');
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     const formData = new FormData();
    //     formData.append('title', title);
    //     formData.append('description', description);
    //     formData.append('email', user.email); // User's email from context
    //     formData.append('file', file); // The image file

    //     axios.post('https://blog-app-c5fz.onrender.com/create', formData, { withCredentials: true })
    //         .then(res => {
    //             if (res.data === "Post created successfully") { // Match backend success message
    //                 navigate('/'); // Redirect to home page after successful post creation
    //             } else {
    //                 alert(res.data.message || "Something went wrong creating the post.");
    //             }
    //         })
    //         .catch(err => {
    //             console.error("Error creating post:", err);
    //             alert("Failed to create post. Please try again.");
    //         });
    // };
// const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!fileUrl.startsWith('http')) {
//         alert("Please enter a valid image URL.");
//         return;
//     }

//     const postData = {
//         title,
//         description,
//         email: user.email,  // User's email from context
//         fileUrl,            // Image URL instead of uploaded file
//     };

//     axios.post('https://blog-app-c5fz.onrender.com/create', postData, { withCredentials: true })
//         .then(res => {
//             if (res.data === "Post created successfully") {
//                 navigate('/');
//             } else {
//                 alert(res.data.message || "Something went wrong creating the post.");
//             }
//         })
//         .catch(err => {
//             console.error("Error creating post:", err);
//             alert("Failed to create post. Please try again.");
//         });
// };

 const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (e.g., max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert("File is too large. Please select an image under 2MB.");
                setFileBase64(''); // Clear previous selection
                e.target.value = ''; // Clear file input
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFileBase64(reader.result); // This will be the Base64 string
            };
            reader.onerror = (error) => {
                console.error("Error reading file:", error);
                alert("Failed to read file.");
            };
            reader.readAsDataURL(file); // Read the file as a Data URL (Base64)
        } else {
            setFileBase64('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!fileBase64) {
            alert("Please select an image file to upload.");
            return;
        }

        const postData = {
            title,
            description,
            email: user.email,
            file: fileBase64, // Send the Base64 string
        };

        try {
            const res = await axios.post('https://blog-app-c5fz.onrender.com/create', postData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json', // We're sending JSON now
                },
            });

            if (res.status === 201 || res.data === "Post created successfully") {
                navigate('/');
            } else {
                alert(res.data.message || "Something went wrong creating the post.");
            }
        } catch (err) {
            console.error("Error creating post:", err);
            alert("Failed to create post. Please try again.");
        }
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
                {/* <div className="create-post-input-group">
                    <label className="create-post-label">Upload Image</label>
                    <input
                        type="file"
                        className="create-post-file-input"
                        onChange={e => setFile(e.target.files[0])}
                        required
                    />
                </div> */}
                <div className="create-post-input-group">
    <label className="create-post-label">Image URL</label>
{/*     <input
        type="file"
        className="create-post-input"
        placeholder="https://example.com/image.jpg"
        onChange={e => setFileUrl(e.target.value)}
        required
    /> */}
                     <input
                        type="file"
                        accept="image/*" // Restrict to image files
                        className="create-post-file-input"
                        onChange={handleFileChange} // Use the new handler
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
