const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = 'ambulink_secret_key_2024';

const authController = {
    // Register new user
    register: async (req, res) => {
        try {
            const { nama, email, password } = req.body;

            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'Email sudah terdaftar' });
            }

            // Create new user
            await User.create({ nama, email, password });

            res.status(201).json({ message: 'Registrasi berhasil' });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server' });
        }
    },

    // Login user
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

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
                { id: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login berhasil',
                token,
                user: {
                    id: user.id,
                    nama: user.nama,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server' });
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