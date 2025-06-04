// server/models/User.js
const db = require("../config/db"); // Pastikan ../config/db.js adalah file yang sudah menggunakan 'pg'
const bcrypt = require("bcryptjs");

class User {
  static async findByEmail(email) {
    const queryText = "SELECT * FROM users WHERE email = $1"; // PERBAIKAN: Gunakan $1
    const values = [email];
    try {
      const result = await db.query(queryText, values); // db.query dari 'pg'
      // PERBAIKAN: Ambil baris dari result.rows
      return result.rows[0]; // Mengembalikan user pertama yang ditemukan, atau undefined jika tidak ada
    } catch (error) {
      console.error("Error in findByEmail:", error);
      throw error;
    }
  }

  static async create(userData) {
    // Asumsi ID bisa jadi disediakan atau auto-generated (SERIAL)
    // Asumsi created_at dan updated_at bisa disediakan atau memiliki DEFAULT di DB
    const { nama, email, password, role } = userData;
    let { id, created_at, updated_at } = userData; // Ambil jika ada

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Siapkan untuk created_at dan updated_at jika tidak disediakan
    // Jika kolom di DB adalah TIMESTAMP atau TIMESTAMPTZ, kirim objek Date
    // Jika kolom di DB adalah DATE, kirim string YYYY-MM-DD
    created_at = created_at || new Date();
    updated_at = updated_at || new Date();

    let queryText;
    let values;

    // Sesuaikan query berdasarkan apakah ID disediakan atau auto-generated
    // Jika ID adalah SERIAL di DB, Anda tidak perlu menyertakannya di INSERT kecuali Anda override
    if (id !== undefined && id !== null) {
      // Jika ID disediakan secara eksplisit
      queryText =
        "INSERT INTO users (id, nama, email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *"; // PERBAIKAN: Gunakan $n dan RETURNING *
      values = [id, nama, email, hashedPassword, role, created_at, updated_at];
    } else {
      // Jika ID auto-generated oleh PostgreSQL (kolom SERIAL/BIGSERIAL)
      queryText =
        "INSERT INTO users (nama, email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *"; // PERBAIKAN: Gunakan $n dan RETURNING *
      values = [nama, email, hashedPassword, role, created_at, updated_at];
    }

    try {
      const result = await db.query(queryText, values);
      // PERBAIKAN: Ambil user yang baru dibuat dari result.rows[0]
      // Ini akan berisi semua kolom yang dikembalikan oleh RETURNING *
      return result.rows[0];
    } catch (error) {
      console.error("Error in User.create:", error);
      throw error;
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    // Fungsi ini seharusnya sudah benar karena bcrypt tidak tergantung pada DB
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error("Error in verifyPassword:", error);
      throw error;
    }
  }
}

module.exports = User;
