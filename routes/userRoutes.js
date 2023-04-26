const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// User profile page
//router.get('/profile/:id', authMiddleware.isAuthenticated, userController.profile);

// Update user profile
//router.post('/profile/:id', authMiddleware.isAuthenticated, userController.updateProfile);

// Delete user profile
//router.delete('/profile/:id', authMiddleware.isAuthenticated, userController.deleteProfile);

module.exports = router;
