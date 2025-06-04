// public/js/db.js
require("dotenv").config();
const { Pool } = require("pg"); // Gunakan driver 'pg'

// Fungsi untuk mem-parsing URL koneksi PostgreSQL dari DATABASE_URL (seperti yang digunakan Prisma)
// Ini cara yang lebih baik daripada mengelola host, user, pass, dll secara terpisah untuk Neon
// karena Neon sering memberikan connection string lengkap.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set!");
  process.exit(1); // Keluar jika DATABASE_URL tidak ada
}

// Konfigurasi untuk 'pg' Pool
// Untuk Neon, connectionString biasanya sudah mencakup semua yang dibutuhkan, termasuk SSL.
const poolConfig = {
  connectionString: connectionString,
  // Opsi SSL biasanya sudah ditangani oleh connectionString dari Neon yang menyertakan ?sslmode=require
  // Namun, jika Anda perlu mengaturnya secara eksplisit (jarang jika DATABASE_URL sudah benar):
  // ssl: {
  //   rejectUnauthorized: false, // Untuk Neon, ini biasanya diperlukan jika sertifikatnya self-signed atau dari CA yang tidak dikenal secara default oleh Node.js
  // },
  // Opsi pool lainnya (opsional, default biasanya cukup baik untuk memulai)
  // max: 20, // jumlah maksimum klien dalam pool
  // idleTimeoutMillis: 30000, // berapa lama klien bisa idle sebelum ditutup
  // connectionTimeoutMillis: 2000, // berapa lama menunggu koneksi sebelum timeout
};

// Log konfigurasi (tanpa menampilkan connectionString penuh yang berisi password)
console.log("Database Configuration (PostgreSQL):", {
  environment: process.env.NODE_ENV || "development", // Sesuaikan jika NODE_ENV berbeda untuk DB
  usingConnectionString: !!connectionString,
});

// Create the connection pool
const pool = new Pool(poolConfig);

// Tambahkan event listener untuk error pada pool
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle PostgreSQL client", {
    message: err.message,
    stack: err.stack, // Penting untuk debugging
  });
  // Anda mungkin ingin menangani error ini dengan lebih baik,
  // misalnya mencoba membuat ulang koneksi atau menghentikan aplikasi jika kritis.
});

// Test connection
async function testConnection() {
  let client;
  try {
    client = await pool.connect(); // Dapatkan klien dari pool
    const res = await client.query("SELECT NOW()"); // Query sederhana ke PostgreSQL
    console.log(
      "Database connection successful. Server time:",
      res.rows[0].now
    );
  } catch (err) {
    console.error("Database connection failed:", {
      message: err.message,
      code: err.code, // Kode error dari pg bisa berbeda dari mysql2
      stack: err.stack,
    });
    if (process.env.NODE_ENV === "development") {
      console.error("Please check:");
      console.error(
        "1. DATABASE_URL in .env is correct and points to your NeonDB."
      );
      console.error("2. NeonDB instance is running and accessible.");
      console.error("3. Network/Firewall allows connection to NeonDB.");
    } else {
      console.error(
        "Production database connection failed. Please check DATABASE_URL and NeonDB status."
      );
    }
  } finally {
    if (client) {
      client.release(); // Selalu lepaskan klien kembali ke pool
    }
  }
}

// Test connection
testConnection();

// Ekspor pool agar bisa digunakan di bagian lain aplikasi Anda
// Fungsi query dari pool sudah mengembalikan Promise secara default di 'pg' versi modern
module.exports = {
  query: (text, params) => pool.query(text, params),
  // Jika Anda membutuhkan akses langsung ke pool (misalnya untuk transaksi)
  pool: pool,
  // Anda juga bisa mengekspor fungsi untuk mendapatkan klien jika perlu (untuk transaksi manual)
  getClient: () => pool.connect(),
};
