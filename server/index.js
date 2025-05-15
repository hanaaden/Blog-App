const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const UserModel= require('./models/UserModel')
const app = express();

// Middleware setup
app.use(cors({
  origin: 'http://localhost:5173', // Update with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/Blog', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

  const verifyUser=(req,res,next)=>{
   const token = req.cookies.token;
   if(!token){
    return res.json("the token is missing")
   }else{
    jwt.verify(token,"jwt-secret-key",(err,decoded)=>{
      if(err){
        return res.json("the token is wrong")
      }else{
        req.email=decoded.email;
        req.username=decoded.username;
        next()
      }
    })
   }
  }

  app.get('/',verifyUser,(req,res)=>{
   return res.json({emaial: req.email, username:req.username})
  })

// Register endpoint
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  bcrypt.hash(password, 10)
    .then(hash => {
      UserModel.create({ username, email, password: hash })
        .then(user => res.json(user))
        .catch(err => res.status(400).json(err));
    })
    .catch(err => console.log(err));
});

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  UserModel.findOne({ email: email })
    .then(user => {
      if (user) {
        bcrypt.compare(password, user.password, (err, response) => {
          if (response) {
            const token = jwt.sign({ email: user.email, username: user.username }, "jwt-secret-key", { expiresIn: "1d" });
             res.cookie('token', token, { 
              httpOnly: true, 
              secure: process.env.NODE_ENV === 'production', // Use secure in production
              sameSite: 'Strict' // Adjust as needed
            });
            return res.json('success');
          } else {
            return res.status(401).json("Password is incorrect");
          }
        });
      } else {
        return res.status(404).json("User does not exist");
      }
    })
    .catch(err => res.status(500).json(err));
});

app.get('/logout',(req,res)=>{
  res.clearCookie('token');
  return res.json("success")
})
// Start the server
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});