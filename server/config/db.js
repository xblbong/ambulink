const mysql = require('mysql2');

const config = {
    development: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'gis_ambulans',
        // Remove SSL for local development
    },
    production: {
        host: process.env.PLANETSCALE_HOST,
        user: process.env.PLANETSCALE_USERNAME,
        password: process.env.PLANETSCALE_PASSWORD,
        database: process.env.PLANETSCALE_DATABASE,
        ssl: {
            rejectUnauthorized: true
        }
    }
};

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create the connection pool
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Convert pool to use promises
const promisePool = pool.promise();

// Add error handling
pool.on('error', (err) => {
    console.error('Database pool error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
        console.error('Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
        console.error('Database connection was refused.');
    }
});

// Test connection with better error handling
async function testConnection() {
    try {
        await promisePool.query('SELECT 1');
        console.log('Database connection successful');
    } catch (err) {
        console.error('Database connection failed:', err.message);
        console.error('Please check:');
        console.error('1. XAMPP/MySQL is running');
        console.error('2. Database "gis_ambulans" exists');
        console.error('3. User credentials are correct');
    }
}

testConnection();

module.exports = promisePool;  