const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const auth = require('../middleware/auth');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Check token validity
router.get('/check-token', auth, (req, res) => {
    res.json({ 
        valid: true,
        user: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role
        }
    });
});

module.exports = router; 