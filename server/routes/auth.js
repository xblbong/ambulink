const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get auth status
router.get('/status', authController.status);

// Logout user
router.post('/logout', authController.logout);

module.exports = router; 