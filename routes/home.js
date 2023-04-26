
const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const userController = require('../controllers/userController');
const {getTopUsers} = require('../controllers/postController');
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/',  getTopUsers , postController.getPopularPosts, homeController.index,);
router.get('/home',  getTopUsers , postController.getPopularPosts, homeController.index,);
router.get('/profile', getTopUsers , postController.getPopularPosts, userController.profile);
router.get('/profile/:id', getTopUsers , postController.getPopularPosts, userController.profileById);


module.exports = router;
