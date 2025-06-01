const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const ambulansRoutes = require('./routes/ambulans');
const reviewRoutes = require('./routes/reviewRoutes');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ambulans', ambulansRoutes);
app.use('/api/review', reviewRoutes);

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        message: 'Terjadi kesalahan pada server'
    });
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
}); 