const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const config = require('../config/config');
const { validationResult } = require('express-validator');

const authController = {
    // Register new user
    register: async (req, res) => {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    message: 'Validation error',
                    errors: errors.array() 
                });
            }

            const { nama, email, password } = req.body;

            // Validate required fields
            if (!nama || !email || !password) {
                return res.status(400).json({ 
                    message: 'Semua field harus diisi',
                    errors: {
                        nama: !nama ? 'Nama harus diisi' : null,
                        email: !email ? 'Email harus diisi' : null,
                        password: !password ? 'Password harus diisi' : null
                    }
                });
            }

            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'Email sudah terdaftar' });
            }

            // Create new user
            await User.create({ nama, email, password });

            res.status(201).json({ message: 'Registrasi berhasil' });
        } catch (error) {
            console.error('Register error:', {
                message: error.message,
                stack: error.stack,
                code: error.code
            });
            
            // Handle specific database errors
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Email sudah terdaftar' });
            }
            
            res.status(500).json({ 
                message: 'Terjadi kesalahan pada server',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Login user
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Validate required fields
            if (!email || !password) {
                return res.status(400).json({ 
                    message: 'Email dan password harus diisi',
                    errors: {
                        email: !email ? 'Email harus diisi' : null,
                        password: !password ? 'Password harus diisi' : null
                    }
                });
            }

            // Check if user exists
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'Email atau password salah' });
            }

            // Verify password
            const isValidPassword = await User.verifyPassword(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Email atau password salah' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET || config.jwtSecret,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login berhasil',
                token,
                user: {
                    id: user.id,
                    nama: user.nama,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Login error:', {
                message: error.message,
                stack: error.stack,
                code: error.code
            });
            res.status(500).json({ 
                message: 'Terjadi kesalahan pada server',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Get current user status
    status: async (req, res) => {
        if (req.session.userId) {
            try {
                const [users] = await db.query('SELECT id, nama, email FROM users WHERE id = ?', [req.session.userId]);
                if (users.length > 0) {
                    return res.json({
                        authenticated: true,
                        user: users[0]
                    });
                }
            } catch (error) {
                console.error('Auth status error:', error);
            }
        }
        res.json({ authenticated: false });
    },

    // Logout user
    logout: (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ message: 'Gagal logout' });
            }
            res.json({ message: 'Logout berhasil' });
        });
    }
};

module.exports = authController; 