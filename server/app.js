require('dotenv').config({path:"../.env"});
const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Session configuration
app.use(session({
  secret: 'ambulink-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Create database pool
const pool = require('./config/db');

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        connection.release();
    })
    .catch(error => {
        console.error('Error connecting to database:', error);
    });

// Routes
const ambulansRouter = require('./routes/ambulans');
const authRouter = require('./routes/auth');
const reviewRouter = require('./routes/reviewRoutes');

app.use('/api/ambulans', ambulansRouter);
app.use('/api/auth', authRouter);
app.use('/api/review', reviewRouter);

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/register.html'));
});

app.get('/tambah', (req, res) => {
  // Check if user is logged in
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, '../public/tambah.html'));
});

app.get('/detail/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/detail.html'));
});

// Database status check endpoint
app.get('/api/db-status', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    
    // Get database information
    const [dbInfo] = await connection.query(`
      SELECT TABLE_NAME, TABLE_ROWS 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, [dbConfig.database]);
    
    connection.release();
    
    res.json({
      status: 'connected',
      database: dbConfig.database,
      tables: dbInfo
    });
  } catch (error) {
    console.error('Database status check failed:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  pool.getConnection()
    .then(connection => {
      connection.release();
      res.json({ status: 'ok', message: 'Server is running and database is connected' });
    })
    .catch(error => {
      console.error('Health check failed:', error);
      res.status(503).json({ 
        status: 'error', 
        message: 'Database connection failed' 
      });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: err.message || 'Terjadi kesalahan pada server',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 