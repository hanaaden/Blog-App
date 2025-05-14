const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const UserModel= require('./models/UserModel')
// Initialize the app
const app = express();

// Middleware setup
app.use(cors({
  origin: 'http://localhost:5173', // Update with your frontend URL
  methods: ['GET', 'POST','PUT','DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

mongoose.connect('mongodb://127.0.0.1:27017/Blog')

app.post('/register',(req,res)=>{
  const {username,email,password}=req.body;
  bcrypt.hash(password,10)
   .then(hash=>{
UserModel.create({username,email,password: hash})
.then(user=>res.json(user))
.catch(err=>res.json(err) )
   }).catch(err=>console.log(err))

})

app.listen(3001,()=>{
    console.log('server is running ')
})