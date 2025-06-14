// index.js (or server.js)

require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
// const multer = require('multer'); // No longer needed for Base64 uploads
const path = require('path');
const fs = require('fs');

// --- Import Mongoose Models ---
// Ensure these files are in your './models/' directory
const UserModel = require('./models/UserModel');
const PostModel = require('./models/PostModel');

const app = express();

// --- Directory Setup for Storing Images ---
const publicDir = path.join(__dirname, 'public');
const imagesDir = path.join(publicDir, 'Images');

// Ensure the 'public' directory exists
if (!fs.existsSync(publicDir)) {
    console.log(`Creating directory: ${publicDir}`);
    fs.mkdirSync(publicDir, { recursive: true });
}
// Ensure the 'public/Images' directory exists
if (!fs.existsSync(imagesDir)) {
    console.log(`Creating directory: ${imagesDir}`);
    fs.mkdirSync(imagesDir, { recursive: true });
}

// --- Middleware Setup ---
app.use(cors({
    origin: 'https://blog-app-leap.vercel.app', // Your frontend URL. Ensure this is correct.
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// IMPORTANT: Place JSON/URL-encoded body parsers BEFORE cookie-parser and static server
// for images to take larger images (if they're part of the JSON/URL-encoded body)
app.use(express.json({ limit: '50mb' })); // Adjust limit as needed, e.g., '50mb' for larger images. '1000mb' is extremely large and might be unnecessary.
app.use(express.urlencoded({ limit: '50mb', extended: true })); // For URL-encoded data if any

app.use(cookieParser()); // Parses cookies from requests

// Serve static files from the 'public' directory.
// This makes files inside 'public' accessible via '/public' in the URL.
// For example, an image at public/Images/my_pic.png will be accessible at /public/Images/my_pic.png
app.use('/public', express.static(publicDir));

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('✅ MongoDB connected');
        // Start the server ONLY after successful MongoDB connection
        app.listen(process.env.PORT || 5000, () => {
            console.log(`🚀 Server is running on port ${process.env.PORT || 5000}`);
        });
    })
    .catch(err => console.error('❌ Failed to connect to MongoDB:', err));

// --- Middleware for Verifying JWT ---
const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json("The token is missing");
    }
    jwt.verify(token, process.env.JWT_SECRET_KEY || "jwt-secret-key-fallback", (err, decoded) => {
        if (err) {
            console.error('Authentication: Token verification failed:', err);
            // Clear invalid token cookie to prevent repeated attempts
            // Ensure these match the options used when setting the cookie on login
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
                path: '/'
            });
            return res.status(401).json("The token is invalid or expired");
        }
        req.email = decoded.email;
        req.username = decoded.username;
        console.log(`Authentication: Token verified for email: ${req.email}, username: ${req.username}`);
        next();
    });
};

// --- User Registration Route ---
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error("Error hashing password:", err);
            return res.status(500).json({ message: "Error hashing password", error: err });
        }
        const newUser = new UserModel({ username, email, password: hash });
        newUser.save()
            .then(() => res.json("User registered successfully"))
            .catch(err => {
                if (err.code === 11000) { // Duplicate key error (e.g., email already exists)
                    return res.status(409).json({ message: "Email already registered" });
                }
                console.error("Error registering user:", err);
                res.status(500).json({ message: "Error registering user", error: err });
            });
    });
});

// --- User Login Route ---
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    UserModel.findOne({ email })
        .then(user => {
            if (!user) return res.status(400).json("User not found");
            bcrypt.compare(password, user.password, (err, match) => {
                if (err) {
                    console.error("Error comparing passwords:", err);
                    return res.status(500).json({ message: "Error comparing passwords", error: err });
                }
                if (match) {
                    const token = jwt.sign({ email: user.email, username: user.username }, process.env.JWT_SECRET_KEY || "jwt-secret-key-fallback", { expiresIn: '1h' });
                    // Set cookie options based on environment
                    res.cookie("token", token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
                        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // 'None' for cross-origin production, 'Lax' for local
                        maxAge: 3600000, // 1 hour
                        path: '/'
                    });
                    res.json("success");
                } else {
                    res.status(400).json("Incorrect password");
                }
            });
        })
        .catch(err => {
            console.error("Error during login:", err);
            res.status(500).json({ message: "Error during login", error: err });
        });
});

// --- Logout Route ---
app.get('/logout', (req, res) => {
    // Clear cookie with matching options
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        path: '/',
    });
    return res.json("success");
});

// --- NO LONGER NEEDED FOR BASE64 UPLOADS, KEEPING IT COMMENTED ---
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, imagesDir);
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
//     }
// });
// const upload = multer({ storage: storage });


// --- Create Post Route (Handles Base64 Image Upload) ---
app.post('/create', verifyUser, async (req, res) => {
    try {
        const postEmail = req.email;
        const { title, description, file } = req.body; // 'file' is expected to be the Base64 string

        if (!title || !description || !file) {
            return res.status(400).json({ message: "Missing required fields (title, description, or image data)." });
        }

        // --- Logic to process Base64 string and save as file ---
        // Ensure the Base64 string includes the data URL prefix (e.g., "data:image/png;base64,...")
        const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ message: "Invalid image data format. Expected a data URL (e.g., data:image/png;base64,...)." });
        }
        const fileType = matches[1].split('/')[1]; // e.g., 'png', 'jpeg'
        const base64Data = matches[2];

        // Create a unique filename
        const filename = `image_${Date.now()}.${fileType}`;
        const filePath = path.join(imagesDir, filename);
        const webAccessiblePath = `/public/Images/${filename}`; // This is the path stored in DB and used by frontend

        // Save the file asynchronously
        fs.writeFile(filePath, base64Data, 'base64', async (err) => {
            if (err) {
                console.error("Error saving image file:", err);
                return res.status(500).json({ message: "Error saving image file. Check server permissions or disk space.", error: err.message });
            }
            console.log(`Image saved to: ${filePath}`);

            try {
                const newPost = new PostModel({
                    title,
                    description,
                    file: webAccessiblePath, // Store the web-accessible path
                    email: postEmail,
                });

                await newPost.save();
                res.status(201).json({ message: "Post created successfully", imagePath: webAccessiblePath }); // Provide image path back
            } catch (dbErr) {
                console.error("Error saving post to database:", dbErr);
                // If DB save fails, consider deleting the file you just saved to prevent orphans
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) console.error("Failed to delete orphaned image file:", unlinkErr);
                });
                res.status(500).json({ message: "Error saving post to database", error: dbErr.message });
            }
        });

    } catch (err) {
        console.error("Unexpected error in /create route:", err);
        res.status(500).json({ message: "Server error during post creation", error: err.message });
    }
});


// --- Get All Posts Route ---
app.get('/getposts', (req, res) => {
    PostModel.find()
        .sort({ createdAt: -1 }) // Sort posts by creation date, newest first
        .then(posts => res.json(posts))
        .catch(err => {
            console.error("Error fetching posts:", err);
            res.status(500).json({ message: "Error fetching posts", error: err });
        });
});

// --- Get Single Post by ID Route ---
app.get('/getpostbyid/:id', (req, res) => {
    PostModel.findById(req.params.id)
        .then(post => {
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            res.json(post);
        })
        .catch(err => {
            console.error("Error fetching post by ID:", err);
            res.status(500).json({ message: "Error fetching post by ID", error: err });
        });
});

// --- Edit Post Route ---
app.put('/editpost/:id', verifyUser, (req, res) => {
    const { title, description } = req.body;

    // IMPORTANT: If you want to allow image updates on edit, you'd need similar Base64 handling here.
    // For now, this route only updates title and description.

    PostModel.findById(req.params.id)
        .then(post => {
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            // Authorization check: Only the post owner can edit
            if (post.email !== req.email) {
                return res.status(403).json({ message: "You are not authorized to edit this post." });
            }

            return PostModel.findByIdAndUpdate(req.params.id, { title, description }, { new: true });
        })
        .then(updatedPost => {
            res.json("Success");
        })
        .catch(err => {
            console.error("Error updating post:", err);
            res.status(500).json({ message: "Error updating post", error: err });
        });
});

// --- Delete Post Route ---
app.delete('/deletepost/:id', verifyUser, (req, res) => {
    PostModel.findById(req.params.id)
        .then(post => {
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            // Authorization check: Only the post owner can delete
            if (post.email !== req.email) {
                return res.status(403).json({ message: "You are not authorized to delete this post." });
            }

            // --- Delete the image file from the server's filesystem ---
            // Only attempt to delete if 'post.file' is a valid local path (starts with /public/Images/)
            if (post.file && post.file.startsWith('/public/Images/')) {
                const imagePath = path.join(__dirname, post.file);
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error(`Error deleting image file '${imagePath}':`, err);
                        // Log error but proceed with post deletion as image might be gone already or path was bad
                    } else {
                        console.log(`Image file deleted from server: ${imagePath}`);
                    }
                });
            } else {
                console.warn(`Post has no associated local image file to delete or path is invalid: ${post.file}`);
            }

            // --- Delete the post document from MongoDB ---
            return PostModel.findByIdAndDelete(req.params.id);
        })
        .then(result => {
            res.json("Success"); // Send success response after post is deleted
        })
        .catch(err => {
            console.error("Error deleting post:", err);
            res.status(500).json({ message: "Error deleting post", error: err });
        });
});


//to see if my backend is running
app.get('/', (req, res) => {
    res.send('Hello from Blog Backend! 2');
});
