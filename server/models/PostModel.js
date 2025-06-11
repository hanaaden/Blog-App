const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    file: { type: String, required: true }, // Stores the relative URL path to the image
    email: { type: String, required: true }, // Email of the user who created the post
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const PostModel = mongoose.model('Post', postSchema);
module.exports = PostModel;