const db = require('../config/db');

exports.findByAmbulansId = (id) => {
  return db.query(`
    SELECT reviews.*, users.nama FROM reviews
    JOIN users ON reviews.user_id = users.id
    WHERE ambulans_id = ?
    ORDER BY created_at DESC
  `, [id]);
};

exports.create = ({ ambulans_id, user_id, rating, komentar }) => {
  return db.query(`
    INSERT INTO reviews (ambulans_id, user_id, rating, komentar)
    VALUES (?, ?, ?, ?)
  `, [ambulans_id, user_id, rating, komentar]);
};

exports.updateRating = (ambulans_id) => {
  return db.query(`
    UPDATE ambulans SET 
      rating = (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE ambulans_id = ?),
      jumlah_rating = (SELECT COUNT(*) FROM reviews WHERE ambulans_id = ?)
    WHERE id = ?
  `, [ambulans_id, ambulans_id, ambulans_id]);
};
