const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

exports.findByAmbulansId = (id) => {
  return db.query(`
    SELECT r.*, u.nama 
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.ambulans_id = ?
    ORDER BY r.created_at DESC
  `, [id]);
};

exports.findByUserAndAmbulans = (userId, ambulansId) => {
  return db.query(`
    SELECT * FROM reviews 
    WHERE user_id = ? AND ambulans_id = ?
  `, [userId, ambulansId]);
};

exports.create = ({ ambulans_id, user_id, rating, komentar }) => {
  const id = uuidv4();
  return db.query(`
    INSERT INTO reviews (id, ambulans_id, user_id, rating, komentar, created_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `, [id, ambulans_id, user_id, rating, komentar]);
};

exports.updateRating = async (ambulans_id) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        ROUND(AVG(rating), 1) as avg_rating,
        COUNT(*) as total_reviews
      FROM reviews 
      WHERE ambulans_id = ?
    `, [ambulans_id]);

    if (rows && rows[0]) {
      await db.query(`
        UPDATE ambulans 
        SET rating = ?, jumlah_rating = ?
        WHERE id = ?
      `, [rows[0].avg_rating || 0, rows[0].total_reviews || 0, ambulans_id]);
    }
  } catch (err) {
    console.error('Error updating rating:', err);
    throw err;
  }
};
