
const express = require('express')
const userController = require('../controller/userController')
const router = express.Router();
const  authenticateUser = require('../middlewares/authMiddleware')

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/create-article',authenticateUser, userController.createArticle);
router.get('/articles', userController.getArticles);
router.get('/article-details/:id', userController.getArticleDetails);
router.post('/article/:id/reaction',authenticateUser, userController.handleReaction);


module.exports = router; 
