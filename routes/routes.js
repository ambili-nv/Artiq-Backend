
const express = require('express')
const userController = require('../controller/userController')
const router = express.Router();
const  authenticateUser = require('../middlewares/authMiddleware')

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/create-article',authenticateUser, userController.createArticle);
router.get('/articles',authenticateUser, userController.getArticles);
router.get('/article-details/:id', userController.getArticleDetails);
router.post('/article/:id/reaction',authenticateUser, userController.handleReaction);
router.get('/my-articles',authenticateUser, userController.getUserArticles);
router.delete('/delete-articles/:id',authenticateUser, userController.deleteArticle);
router.put('/edit-articles/:id',authenticateUser, userController.updateArticle);
router.get('/article/:id', authenticateUser,userController.getArticleById);

router.get('/user-profile', authenticateUser, userController.getUserProfile);
router.put('/update-profile', authenticateUser, userController.updateUserProfile);
router.post('/change-password', authenticateUser, userController.changePassword);
router.post('/verify-password', authenticateUser, userController.verifyPassword);

module.exports = router; 
