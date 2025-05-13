const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

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

app.listen(3001,()=>{
    console.log('server is running git init')
})