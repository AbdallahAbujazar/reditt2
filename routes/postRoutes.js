const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const postController = require('../controllers/postController');

// Route for creating a new post
//router.post('/posts', authController.verifyToken, postController.createPost);

// Route for retrieving a specific post by ID
router.get('/posts/:id', postController.getPostById);

// Route for updating a post by ID
router.put('/posts/:id', postController.updatePost);

// Route for deleting a post by ID
router.delete('/posts/:id', postController.deletePost);

module.exports = router;
