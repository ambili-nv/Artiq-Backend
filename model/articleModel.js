// // models/Article.js
// const mongoose = require('mongoose');

// const articleSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         required: true,
//     },
//     description: {
//         type: String,
//         required: true,
//     },
//     images: [String],  // Array of image URLs uploaded to Cloudinary
//     tags: [String],     // Array of tags
//     category: {
//         type: String,
//         enum: ['sports', 'politics', 'space'],  // Add categories here
//         required: true,
//     },
//     author: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true,  // Assuming you're tracking article authors
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },
// });

// const Article = mongoose.model('Article', articleSchema);
// module.exports = Article;



// models/Article.js
const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    images: [String],  // Array of image URLs uploaded to Cloudinary
    tags: [String],     // Array of tags
    category: {
        type: String,
        enum: ['sports', 'politics', 'space'],  // Add categories here
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,  // Assuming you're tracking article authors
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],   // Array of user IDs who liked the article
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs who disliked the article
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Article = mongoose.model('Article', articleSchema);
module.exports = Article;

