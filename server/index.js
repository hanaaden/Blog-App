// server.js (or index.js)

require('dotenv').config(); // Make sure you have dotenv installed and configured if using .env file
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Assuming you have these models in './models/' directory
const UserModel = require('./models/UserModel');
const PostModel = require('./models/PostModel');

const app = express();

// --- Directory Setup for Images ---
const publicDir = path.join(__dirname, 'public');
const imagesDir = path.join(publicDir, 'Images');

// Ensure the 'public' directory exists
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}
// Ensure the 'public/Images' directory exists
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// --- Middleware Setup ---
app.use(cors({
    origin: 'https://blog-app-leap.vercel.app', // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files from the 'public' directory
// This makes files inside 'public' accessible via '/public' in the URL
app.use('/public', express.static(publicDir));

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('✅ MongoDB connected');
        app.listen(process.env.PORT || 5000, () => { // Use PORT from .env or default to 5000
            console.log(`🚀 Server is running on port ${process.env.PORT || 5000}`);
        });
    })
    .catch(err => console.error('❌ Failed to connect to MongoDB:', err));

// --- Middleware for verifying JWT ---
const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json("The token is missing");
    }
    jwt.verify(token, process.env.JWT_SECRET_KEY || "jwt-secret-key", (err, decoded) => { // Use environment variable for secret
        if (err) {
            return res.status(401).json("The token is invalid");
        }
        req.email = decoded.email;
        req.username = decoded.username;
        next();
    });
};

// --- User Registration ---
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ message: "Error hashing password", error: err });
        const newUser = new UserModel({ username, email, password: hash });
        newUser.save()
            .then(() => res.json("User registered successfully"))
            .catch(err => {
                if (err.code === 11000) { // Duplicate key error (e.g., email already exists)
                    return res.status(409).json({ message: "Email already registered" });
                }
                res.status(500).json({ message: "Error registering user", error: err });
            });
    });
});

// --- User Login ---
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    UserModel.findOne({ email })
        .then(user => {
            if (!user) return res.status(400).json("User not found");
            bcrypt.compare(password, user.password, (err, match) => {
                if (err) return res.status(500).json({ message: "Error comparing passwords", error: err });
                if (match) {
                    const token = jwt.sign({ email: user.email, username: user.username }, process.env.JWT_SECRET_KEY || "jwt-secret-key", { expiresIn: '1h' }); // Add expiration
                    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' }); // Added secure and sameSite
                    res.json("success");
                } else {
                    res.status(400).json("Incorrect password");
                }
            });
        })
        .catch(err => res.status(500).json({ message: "Error during login", error: err }));
});

// --- Logout ---
app.get('/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
    return res.json("success");
});

// --- Multer Storage Configuration for Images ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imagesDir); // Save to public/Images directory
    },
    filename: (req, file, cb) => {
        // Create a unique filename: original fieldname + timestamp + original extension
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- Create a Post ---
app.post('/create', verifyUser, upload.single('file'), (req, res) => {
    // You're now passing email from the frontend in formData
    // If you want to strictly use the email from the verified token:
    // const postEmail = req.email;
    // For now, sticking with req.body.email as in your original code if preferred
    const postEmail = req.body.email; // Or req.email if you change frontend to not send email in formData

    if (!req.file) {
        return res.status(400).json({ message: "No image file provided." });
    }

    const newPost = new PostModel({
        title: req.body.title,
        description: req.body.description,
        // Store the public URL path for the image
        file: `/public/Images/${req.file.filename}`, // This is the crucial part for display
        email: postEmail,
    });

    newPost.save()
        .then(() => res.json("Post created successfully"))
        .catch(err => res.status(500).json({ message: "Error saving post", error: err }));
});

// --- Get All Posts ---
app.get('/getposts', (req, res) => {
    PostModel.find()
        .sort({ createdAt: -1 }) // Optional: sort by creation date
        .then(posts => res.json(posts))
        .catch(err => res.status(500).json({ message: "Error fetching posts", error: err }));
});

// --- Get Post by ID ---
app.get('/getpostbyid/:id', (req, res) => {
    PostModel.findById(req.params.id)
        .then(post => {
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            res.json(post);
        })
        .catch(err => res.status(500).json({ message: "Error fetching post by ID", error: err }));
});

// --- Edit Post ---
// Assuming edit post does not change the image, or you'd need multer again
app.put('/editpost/:id', verifyUser, (req, res) => {
    const { title, description } = req.body;

    PostModel.findById(req.params.id)
        .then(post => {
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            // Optional: Only allow the owner to edit
            if (post.email !== req.email) {
                return res.status(403).json({ message: "You are not authorized to edit this post." });
            }

            return PostModel.findByIdAndUpdate(req.params.id, { title, description }, { new: true });
        })
        .then(updatedPost => {
            res.json("Success");
        })
        .catch(err => res.status(500).json({ message: "Error updating post", error: err }));
});

// --- Delete Post ---
app.delete('/deletepost/:id', verifyUser, (req, res) => {
    PostModel.findById(req.params.id)
        .then(post => {
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            // Optional: Only allow the owner to delete
            if (post.email !== req.email) {
                return res.status(403).json({ message: "You are not authorized to delete this post." });
            }

            // Delete the image file from the server's filesystem
            const imagePath = path.join(__dirname, post.file); // Reconstruct absolute path
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) console.error("Error deleting image file:", err);
                    else console.log("Image file deleted from server:", imagePath);
                });
            }

            return PostModel.findByIdAndDelete(req.params.id);
        })
        .then(result => {
            res.json("Success");
        })
        .catch(err => res.status(500).json({ message: "Error deleting post", error: err }));
});