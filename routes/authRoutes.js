const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route for user registration
router.post('/register', authController.register);



// Route for user logout
router.get('/logout', authController.logout);

module.exports = router;
