const express = require('express');
const  {verifyEmail, register, login, refreshToken, logout, forgotPassword, resetPassword} = require('../controllers/authControllers');

const router = express.Router();

// Register Route
router.post('/register', register);
// Login Route
router.post('/login', login);
router.post('/refresh-token',refreshToken );
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email', verifyEmail);



module.exports = router;