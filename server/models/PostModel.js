const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    file: { type: String, required: true }, // To store the relative URL path to the image
    email: { type: String, required: true }, // Email of the user who created the post
}, { timestamps: true }); // Add timestamps for createdAt and updatedAt

const PostModel = mongoose.model('Post', postSchema);
module.exports = PostModel;