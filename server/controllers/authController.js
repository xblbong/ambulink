// authController.js

// Asumsikan db.js sudah dikonfigurasi untuk PostgreSQL (node-postgres) dan diekspor dengan benar
// const db = require('../path/to/your/db'); // Impor db jika fungsi 'status' akan tetap di sini
// Jika model User sudah menggunakan db yang benar, Anda mungkin tidak perlu db langsung di controller ini kecuali untuk kasus khusus.

const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs"); // bcryptjs biasanya digunakan di dalam model User
const User = require("../models/User"); // Pastikan User model sudah diupdate untuk PostgreSQL
const config = require("../config/config"); // Pastikan config.jwtSecret atau process.env.JWT_SECRET ada
const { validationResult } = require("express-validator");
// const { v4: uuidv4 } = require("uuid"); // Tidak lagi dibutuhkan jika ID dihasilkan oleh DB

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation error",
          errors: errors.array(),
        });
      }

      const { nama, email, password } = req.body;

      if (!nama || !email || !password) {
        return res.status(400).json({
          message: "Semua field harus diisi",
          // Anda bisa menyederhanakan ini jika validasi express-validator sudah mencakup required fields
        });
      }

      // Check if user already exists (logic ini ada di User.findByEmail)
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }

      // --- PERTIMBANGAN UNTUK ID DAN TIMESTAMPS ---
      // Jika 'id' adalah SERIAL/BIGSERIAL di PostgreSQL, Anda tidak perlu membuatnya di sini.
      // Jika 'created_at' dan 'updated_at' memiliki DEFAULT CURRENT_TIMESTAMP atau diurus oleh ORM/model,
      // Anda juga tidak perlu menyediakannya secara manual.

      // Contoh jika Anda ingin tetap menyediakan timestamp dari aplikasi (misalnya untuk tipe DATE)
      // const now = new Date();
      // const formattedDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

      const userData = {
        nama,
        email,
        password, // Password akan di-hash di dalam User.create
        role: "user",
        // created_at: new Date(), // Kirim objek Date jika kolomnya TIMESTAMP/TIMESTAMPTZ
        // updated_at: new Date(), // Kirim objek Date jika kolomnya TIMESTAMP/TIMESTAMPTZ
        // Jika kolomnya DATE: created_at: formattedDate
      };

      // Jika ID auto-generated oleh DB, hapus 'id' dari userData
      // const userID = ... (logika ID lama Anda);
      // userData.id = userID;

      // Create new user (User.create akan menangani hashing password dan interaksi DB)
      const newUser = await User.create(userData); // Asumsi User.create mengembalikan user yang baru dibuat

      res
        .status(201)
        .json({ message: "Registrasi berhasil", userId: newUser.id }); // Kembalikan ID user jika perlu
    } catch (error) {
      console.error("Register error:", {
        message: error.message,
        stack: error.stack,
        code: error.code, // Kode error dari driver pg
      });

      // PERBAIKAN: Gunakan kode error PostgreSQL untuk unique violation
      if (error.code === "23505") {
        // Kode '23505' untuk unique_violation di PostgreSQL
        return res
          .status(400)
          .json({ message: "Email atau field unik lainnya sudah terdaftar" });
      }

      res.status(500).json({
        message: "Terjadi kesalahan pada server saat registrasi",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email dan password harus diisi",
        });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Email atau password salah" });
      }

      // User.verifyPassword akan membandingkan password yang diberikan dengan hash di DB
      const isValidPassword = await User.verifyPassword(
        password,
        user.password
      );
      if (!isValidPassword) {
        return res.status(401).json({ message: "Email atau password salah" });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET || config.jwtSecret, // Pastikan JWT_SECRET ada
        { expiresIn: "24h" }
      );

      res.json({
        message: "Login berhasil",
        token,
        user: {
          // Hanya kirim data user yang aman dan relevan ke klien
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", {
        message: error.message,
        stack: error.stack,
        code: error.code,
      });
      res.status(500).json({
        message: "Terjadi kesalahan pada server saat login",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Get current user status (Jika menggunakan session)
  // Jika Anda menggunakan JWT untuk state, endpoint ini mungkin mengambil user info dari token yang divalidasi middleware
  status: async (req, res) => {
    // Jika menggunakan session dan req.session.userId ada
    if (req.session && req.session.userId) {
      try {
        // Pastikan 'db' diimpor dan dikonfigurasi untuk PostgreSQL
        // const db = require('../path/to/your/db');
        // PERBAIKAN: Gunakan placeholder $1 dan ambil dari result.rows
        const result = await db.query(
          // Ganti `db` dengan cara Anda mengakses koneksi DB
          "SELECT id, nama, email, role FROM users WHERE id = $1",
          [req.session.userId]
        );
        const users = result.rows;

        if (users.length > 0) {
          return res.json({
            authenticated: true,
            user: users[0],
          });
        } else {
          // User ID di session tidak valid atau user tidak ditemukan
          return res.json({
            authenticated: false,
            message: "User not found for session ID.",
          });
        }
      } catch (error) {
        console.error("Auth status error:", error);
        return res
          .status(500)
          .json({ message: "Error retrieving auth status." });
      }
    }
    // Jika menggunakan otentikasi berbasis token (JWT), middleware otentikasi akan mengisi req.user
    // if (req.user) { // req.user diisi oleh middleware JWT
    //   return res.json({
    //     authenticated: true,
    //     user: {
    //       id: req.user.id,
    //       nama: req.user.nama, // Anda perlu memastikan middleware mengambil data ini
    //       email: req.user.email,
    //       role: req.user.role,
    //     },
    //   });
    // }
    res.json({ authenticated: false });
  },

  // Logout user (untuk session-based auth)
  logout: (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ message: "Gagal logout" });
        }
        res.clearCookie("connect.sid"); // Nama cookie default untuk express-session
        return res.json({ message: "Logout berhasil" });
      });
    } else {
      // Jika menggunakan JWT, logout biasanya ditangani di sisi klien dengan menghapus token
      return res.json({
        message:
          "Tidak ada sesi aktif untuk logout atau gunakan penghapusan token di client.",
      });
    }
  },
};

module.exports = authController;
