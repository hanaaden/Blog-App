// index.js (or server.js)

require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const multer = require('multer');
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
app.use(express.json()); // Parses incoming JSON requests
app.use(cookieParser()); // Parses cookies from requests
//for images to take larger images
app.use(express.json({ limit: '1000mb' })); // Adjust limit as needed, e.g., '50mb' for larger images
app.use(express.urlencoded({ limit: '1000mb', extended: true })); // For URL-encoded data if any
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
    jwt.verify(token, process.env.JWT_SECRET_KEY || "jwt-secret-key-fallback", (err, decoded) => { // Use environment variable for secret, with a fallback
        if (err) {
            return res.status(401).json("The token is invalid");
        }
        req.email = decoded.email;
        req.username = decoded.username;
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
                    const token = jwt.sign({ email: user.email, username: user.username }, process.env.JWT_SECRET_KEY || "jwt-secret-key-fallback", { expiresIn: '1h' }); // Add expiration
                    // Set cookie options for production (secure: true, sameSite: 'None')
                    res.cookie("token", token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Adjust SameSite for cross-origin if needed
                        maxAge: 3600000 // 1 hour
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
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });
    return res.json("success");
});

// --- Multer Storage Configuration for Image Uploads ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Save files to the public/Images directory
        cb(null, imagesDir);
    },
    filename: (req, file, cb) => {
        // Create a unique filename using fieldname, timestamp, and original extension
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- Create Post Route ---
// This route is protected by verifyUser middleware to ensure only logged-in users can create posts
// app.post('/create', verifyUser, upload.single('file'), (req, res) => {
//     // We get the user's email from the JWT token (req.email set by verifyUser middleware)
//     // However, your frontend sends req.body.email. For consistency, let's use req.email from token
//     const postEmail = req.email; // Use email from the authenticated token

//     if (!req.file) {
//         return res.status(400).json({ message: "No image file provided. Please upload an image." });
//     }

//     const newPost = new PostModel({
//         title: req.body.title,
//         description: req.body.description,
//         // Store the web-accessible path for the image in the database.
//         // This path will be used by the frontend to construct the image URL.
//         file: `/public/Images/${req.file.filename}`, // IMPORTANT: Added leading slash "/" here
//         email: postEmail, // Use the email from the authenticated user
//     });

//     newPost.save()
//         .then(() => res.json("Post created successfully"))
//         .catch(err => {
//             console.error("Error saving post:", err);
//             res.status(500).json({ message: "Error saving post", error: err });
//         });
// });

// app.post('/create', verifyUser, (req, res) => {
//     const postEmail = req.email;
//     const { title, description, fileUrl } = req.body;

//     if (!fileUrl) {
//         return res.status(400).json({ message: "No image URL provided." });
//     }

//     const newPost = new PostModel({
//         title,
//         description,
//         file: fileUrl, // This is now just a URL, not a path to a local file
//         email: postEmail,
//     });

//     newPost.save()
//         .then(() => res.json("Post created successfully"))
//         .catch(err => {
//             console.error("Error saving post:", err);
//             res.status(500).json({ message: "Error saving post", error: err });
//         });
// });
// --- Multer Storage Configuration for Image Uploads ---
// Keep this commented out if you are NOT using multer.
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, imagesDir);
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
//     }
// });
// const upload = multer({ storage: storage });

// IMPORTANT: This is the correct route to handle Base64 image uploads
app.post('/create', verifyUser, async (req, res) => { // Make it async
    try {
        const postEmail = req.email;
        const { title, description, file } = req.body; // <--- Correctly destructure 'file'

        if (!file || !title || !description) { // Check for all required fields
            return res.status(400).json({ message: "Missing fields (title, description, or image)." });
        }

        // --- Logic to process Base64 string and save as file ---
        // Extract file type (e.g., 'png', 'jpeg') from Base64 string
        const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ message: "Invalid image data format." });
        }
        const fileType = matches[1].split('/')[1]; // e.g., 'png', 'jpeg'
        const base64Data = matches[2];

        // Create a unique filename
        const filename = `image_${Date.now()}.${fileType}`;
        const filePath = path.join(imagesDir, filename);
        const webAccessiblePath = `/public/Images/${filename}`;

        // Convert Base64 to a buffer and save the file asynchronously
        fs.writeFile(filePath, base64Data, 'base64', async (err) => {
            if (err) {
                console.error("Error saving image file:", err);
                return res.status(500).json({ message: "Error saving image file", error: err });
            }

            const newPost = new PostModel({
                title,
                description,
                file: webAccessiblePath, // Store the local path where the file is saved
                email: postEmail,
            });

            const savedPost = await newPost.save();
            res.status(201).json("Post created successfully"); // Or send back the savedPost object
        });

    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ message: "Error creating post", error: err });
    }
});

// IMPORTANT: COMMENT OUT OR REMOVE THE OLD, INCORRECT /CREATE ROUTE THAT EXPECTS 'fileUrl'
// app.post('/create', verifyUser, (req, res) => {
//     const postEmail = req.email;
//     const { title, description, fileUrl } = req.body; // THIS IS WRONG FOR BASE64 UPLOADS

//     if (!fileUrl) {
//         return res.status(400).json({ message: "No image URL provided." });
//     }
//     // ... rest of the old logic
// });

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
            // updatedPost will be the document after update. You can send it back if needed.
            res.json("Success");
        })
        .catch(err => {
            console.error("Error updating post:", err);
            res.status(500).json({ message: "Error updating post", error: err });
        });
});

// // --- Delete Post Route ---
// app.delete('/deletepost/:id', verifyUser, (req, res) => {
//     PostModel.findById(req.params.id)
//         .then(post => {
//             if (!post) {
//                 return res.status(404).json({ message: "Post not found" });
//             }
//             // Authorization check: Only the post owner can delete
//             if (post.email !== req.email) {
//                 return res.status(403).json({ message: "You are not authorized to delete this post." });
//             }

//             // --- Delete the image file from the server's filesystem ---
//             // Reconstruct the absolute path to the image file
//             const imagePath = path.join(__dirname, post.file);
//             if (fs.existsSync(imagePath)) {
//                 fs.unlink(imagePath, (err) => {
//                     if (err) {
//                         console.error("Error deleting image file from server:", err);
//                         // Log error but proceed with post deletion as image might be gone already
//                     } else {
//                         console.log("Image file deleted from server:", imagePath);
//                     }
//                 });
//             } else {
//                 console.warn("Image file not found on server at path:", imagePath);
//             }

//             // --- Delete the post document from MongoDB ---
//             return PostModel.findByIdAndDelete(req.params.id);
//         })
//         .then(result => {
//             res.json("Success"); // Send success response after post is deleted
//         })
//         .catch(err => {
//             console.error("Error deleting post:", err);
//             res.status(500).json({ message: "Error deleting post", error: err });
//         });
// });
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

            // --- REMOVED LOCAL FILE DELETION LOGIC HERE ---
            // Because 'file' is now a URL, not a local path to delete.
            // If you later integrate with a cloud storage service (e.g., Cloudinary),
            // you would put the deletion logic for that service here.

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

