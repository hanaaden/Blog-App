const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const UserModel = require('./models/UserModel');
const PostModel = require('./models/PostModel');

const app = express();

// Ensure the Images directory exists
const imagesDir = path.join(__dirname, 'public', 'Images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// Middleware setup
app.use(cors({
    origin: 'http://localhost:5173', // Adjust as needed
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/public', express.static('public')); // Serve static files from 'public'

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/Blog', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('✅ MongoDB connected');
        app.listen(3001, () => {
            console.log('🚀 Server is running on port 3001');
        });
    })
    .catch(err => console.error('❌ Failed to connect to MongoDB:', err));

// Middleware for verifying JWT
const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json("The token is missing");
    }
    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
        if (err) {
            return res.status(401).json("The token is invalid");
        }
        req.email = decoded.email;
        req.username = decoded.username;
        next();
    });
};

// User registration
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json(err);
        const newUser = new UserModel({ username, email, password: hash });
        newUser.save()
            .then(() => res.json("User registered successfully"))
            .catch(err => res.status(500).json(err));
    });
});

// User login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    UserModel.findOne({ email })
        .then(user => {
            if (!user) return res.status(400).json("User not found");
            bcrypt.compare(password, user.password, (err, match) => {
                if (match) {
                    const token = jwt.sign({ email: user.email, username: user.username }, "jwt-secret-key");
                    res.cookie("token", token, { httpOnly: true });
                    res.json("success");
                } else {
                    res.status(400).json("Incorrect password");
                }
            });
        })
        .catch(err => res.status(500).json(err));
});

// Logout
app.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json("success");
});

// Create a post
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/Images');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.post('/create', verifyUser, upload.single('file'), (req, res) => {
    const newPost = new PostModel({
        title: req.body.title,
        description: req.body.description,
        file: req.file.path,
        email: req.body.email,
    });

    newPost.save()
        .then(() => res.json("File uploaded successfully"))
        .catch(err => res.status(500).json(err));
});

app.get('/getposts', (req, res) => {
    PostModel.find()
        .then(posts => res.json(posts))
        .catch(err => res.status(500).json(err));
});

// Get post by ID
app.get('/getpostbyid/:id', (req, res) => {
    PostModel.findById(req.params.id)
        .then(post => {
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            res.json(post);
        })
        .catch(err => res.status(500).json(err));
});

// Edit post
app.put('/editpost/:id', (req, res) => {
    const { title, description } = req.body;

    PostModel.findByIdAndUpdate(req.params.id, { title, description }, { new: true })
        .then(updatedPost => {
            if (!updatedPost) {
                return res.status(404).json({ message: "Post not found" });
            }
            res.json("Success");
        })
        .catch(err => res.status(500).json(err));
});

// Delete post
app.delete('/deletepost/:id', (req, res) => {
    PostModel.findByIdAndDelete(req.params.id)
        .then(result => {
            if (!result) {
                return res.status(404).json({ message: "Post not found" });
            }
            res.json("Success");
        })
        .catch(err => res.status(500).json(err));
});