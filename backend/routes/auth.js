const express = require('express');//import express
const router = express.Router();//import router dari express
//import controller auth isinya register, login, refresh token, logout, get profile
const authController = require('../controllers/authController');
//import middleware auth untuk verifikasi token(verifyAccessToken, verifyRefreshToken)
const { verifyAccessToken, verifyRefreshToken } = require('../middleware/auth');
//import express-validator untuk validasi input
const { body } = require('express-validator');

const validateRegister = [
  //validasi input untuk register trim untuk menghilangkan spasi di awal dan akhir isLength untuk panjang karakter
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  //validasi email dengan isEmail dan normalizeEmail untuk normalisasi email
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const validateLogin = [
  //validasi input untuk login trim untuk menghilangkan spasi di awal dan akhir dan notEmpty untuk memastikan tidak kosong
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', verifyRefreshToken, authController.refreshToken);
router.post('/logout', verifyAccessToken, authController.logout);
router.get('/profile', verifyAccessToken, authController.getProfile);

module.exports = router;