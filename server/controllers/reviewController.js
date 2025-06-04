// ../controllers/reviewController.js (atau path yang sesuai)
const Review = require("../models/reviewModel"); // Sesuaikan path jika perlu

// Handler untuk GET reviews
exports.getReviewsByAmbulans = async (req, res) => {
  try {
    const ambulansId = req.params.ambulans_id; // Ambil dari params
    if (!ambulansId) {
      return res.status(400).json({ message: "ID Ambulans diperlukan" });
    }
    const reviews = await Review.findByAmbulansId(ambulansId);
    res.json(reviews || []); // Model findByAmbulansId sudah mengembalikan array (rows)
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({
      message: "Error fetching reviews",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Handler untuk POST review
exports.addReview = async (req, res) => {
  try {
    const { ambulans_id, rating, komentar } = req.body;
    // Pastikan req.user ada dan memiliki id, jika authMiddleware Anda mengaturnya
    const user_id = req.user ? req.user.id : null;

    // Debug logging
    console.log("Attempting to add review with data:", {
      ambulans_id,
      user_id,
      rating,
      komentar,
    });

    // Validate input
    if (!ambulans_id || !user_id) {
      // Periksa user_id juga
      return res
        .status(400)
        .json({
          message: "ID ambulans dan user (dari token) harus diisi",
          success: false,
        });
    }
    if (rating === undefined || rating === null || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating harus antara 1-5", success: false });
    }

    // Check if user has already reviewed this ambulance
    const existingReview = await Review.findByUserAndAmbulans(
      user_id,
      ambulans_id
    );
    console.log("Existing review object (or undefined):", existingReview);

    if (existingReview) {
      return res
        .status(400)
        .json({
          message: "Anda sudah memberikan review untuk ambulans ini",
          success: false,
        });
    }

    // Create review
    const newReview = await Review.create({
      ambulans_id: parseInt(ambulans_id),
      user_id: parseInt(user_id),
      rating: parseInt(rating),
      komentar: komentar || "",
    });
    console.log("New review created:", newReview);

    if (!newReview || !newReview.id) {
      console.error(
        "Review creation in model might have failed, did not return expected object."
      );
      return res
        .status(500)
        .json({
          message: "Gagal membuat entri review di database",
          success: false,
        });
    }

    await Review.updateRating(ambulans_id);

    res
      .status(201)
      .json({
        message: "Review berhasil disimpan",
        success: true,
        review: newReview,
      });
  } catch (err) {
    // ... (error handling Anda yang sudah ada) ...
    console.error("Gagal tambah review:", {
      error: err,
      message: err.message,
      stack: err.stack,
      code: err.code,
      sqlMessage: err.sqlMessage,
      sql: err.sql,
    });
    res.status(500).json({
      message: "Gagal menyimpan review. Silakan coba lagi.",
      success: false,
      details:
        process.env.NODE_ENV === "development"
          ? { error: err.message, sql: err.sql, code: err.code }
          : undefined,
    });
  }
};

// Pastikan tidak ada export lain yang menimpa `exports`
// Misalnya, jangan ada `module.exports = someOtherObject;` di akhir file ini
// jika Anda menggunakan `exports.namaFungsi = ...`
