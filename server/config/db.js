require("dotenv").config();
const mysql = require("mysql2");

const config = {
  development: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "gis_ambulans",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  },
  production: {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "gis_ambulans",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  ssl: {
    rejectUnauthorized: false,
  },
  connectTimeout: 10000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
},
};

const env = process.env.NODE_ENV || "production";
const dbConfig = config[env];

// Log configuration (without sensitive data)
console.log("Database Configuration:", {
  environment: env,
  host: dbConfig.host,
  database: dbConfig.database,
  configured: !!(dbConfig.host && dbConfig.user && dbConfig.database),
});

// Create the connection pool
const pool = mysql.createPool(dbConfig);

// Convert pool to use promises
const promisePool = pool.promise();

// Add error handling
pool.on("error", (err) => {
  console.error("Database pool error:", {
    code: err.code,
    message: err.message,
    fatal: err.fatal,
    state: err.sqlState,
  });
});

// Test connection with better error handling
async function testConnection() {
  try {
    await promisePool.query("SELECT 1");
    console.log("Database connection successful");
  } catch (err) {
    console.error("Database connection failed:", {
      message: err.message,
      code: err.code,
      state: err.sqlState,
      fatal: err.fatal,
    });

    if (process.env.NODE_ENV === "development") {
      console.error("Please check:");
      console.error("1. XAMPP/MySQL is running");
      console.error('2. Database "gis_ambulans" exists');
      console.error("3. User credentials are correct");
    } else {
      console.error(
        "Production database connection failed. Please check environment variables and SSL configuration."
      );
    }
  }
}

// Test connection in both environments
testConnection();

module.exports = promisePool;
