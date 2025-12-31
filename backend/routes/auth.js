const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyAccessToken, verifyRefreshToken } = require('../middleware/auth');
const { body } = require('express-validator');

const validateRegister = [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const validateLogin = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', verifyRefreshToken, authController.refreshToken);
router.post('/logout', verifyAccessToken, authController.logout);
router.get('/profile', verifyAccessToken, authController.getProfile);

module.exports = router;