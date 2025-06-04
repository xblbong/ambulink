// public/models/reviewModel.js
const db = require("../config/db"); // Pastikan ../config/db.js adalah file yang sudah menggunakan 'pg'
// const { v4: uuidv4 } = require("uuid"); // Tidak lagi dibutuhkan jika ID adalah SERIAL

exports.findByAmbulansId = async (ambulansId) => {
  const queryText = `
    SELECT r.*, u.nama AS user_nama -- Alias untuk kolom nama dari tabel users
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.ambulans_id = $1
    ORDER BY r.created_at DESC
  `;
  const values = [ambulansId];
  try {
    const result = await db.query(queryText, values);
    return result.rows; // Mengembalikan array semua review yang cocok
  } catch (error) {
    console.error("Error in findByAmbulansId:", error);
    throw error;
  }
};

exports.findByUserAndAmbulans = async (userId, ambulansId) => {
  const queryText = `
    SELECT * FROM reviews 
    WHERE user_id = $1 AND ambulans_id = $2
  `;
  const values = [userId, ambulansId];
  try {
    const result = await db.query(queryText, values);
    return result.rows[0]; // Mengembalikan review pertama yang cocok (jika ada)
  } catch (error) {
    console.error("Error in findByUserAndAmbulans:", error);
    throw error;
  }
};

exports.create = async ({ ambulans_id, user_id, rating, komentar }) => {
  // Asumsi kolom 'id' di tabel 'reviews' adalah SERIAL/BIGSERIAL (auto-increment)
  // Asumsi kolom 'created_at' memiliki DEFAULT CURRENT_TIMESTAMP atau Anda akan menyediakannya
  // const reviewID = ...; // Hapus pembuatan ID manual jika ID adalah SERIAL

  const queryText = `
    INSERT INTO reviews (ambulans_id, user_id, rating, komentar, created_at)
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
    RETURNING * 
  `;
  // Jika Anda ingin mengontrol created_at dari aplikasi:
  // VALUES ($1, $2, $3, $4, $5) RETURNING *
  // const values = [ambulans_id, user_id, rating, komentar, new Date()];

  const values = [ambulans_id, user_id, rating, komentar];

  try {
    const result = await db.query(queryText, values);
    return result.rows[0]; // Mengembalikan review yang baru dibuat
  } catch (error) {
    console.error("Error in review create:", error);
    throw error;
  }
};

exports.updateRating = async (ambulans_id) => {
  try {
    // Query untuk menghitung rata-rata rating dan jumlah review
    const avgRatingQuery = `
      SELECT 
        ROUND(AVG(rating)::numeric, 1) as avg_rating, -- Casting ke numeric untuk ROUND
        COUNT(*) as total_reviews
      FROM reviews 
      WHERE ambulans_id = $1
    `;
    const avgRatingResult = await db.query(avgRatingQuery, [ambulans_id]);

    let avgRating = 0;
    let totalReviews = 0;

    if (
      avgRatingResult.rows.length > 0 &&
      avgRatingResult.rows[0].total_reviews > 0
    ) {
      avgRating = avgRatingResult.rows[0].avg_rating;
      totalReviews = avgRatingResult.rows[0].total_reviews;
    }

    // Query untuk mengupdate tabel ambulans
    const updateAmbulansQuery = `
        UPDATE ambulans 
        SET rating = $1, jumlah_rating = $2
        WHERE id = $3
      `;
    await db.query(updateAmbulansQuery, [avgRating, totalReviews, ambulans_id]);
  } catch (err) {
    console.error("Error updating rating:", err);
    throw err;
  }
};
