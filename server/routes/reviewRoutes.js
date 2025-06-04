// reviewRoutes.js
const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController"); // <-- PERIKSA PATH INI
const validateReview = require("../middleware/validateReview");
const authMiddleware = require("../middleware/auth"); // <-- PERIKSA PATH INI

// Log seluruh objek controller dan fungsi spesifik
console.log("--- reviewController object ---");
console.log(reviewController);
console.log("--- typeof reviewController.getReviewsByAmbulans ---");
console.log(typeof reviewController.getReviewsByAmbulans);
console.log("--- typeof reviewController.addReview ---");
console.log(typeof reviewController.addReview);
console.log("-----------------------------");

// Ambil semua review untuk ambulans tertentu
router.get("/:ambulans_id", reviewController.getReviewsByAmbulans); // <-- Error mengarah ke sini

router.post("/", authMiddleware, validateReview, reviewController.addReview);

module.exports = router;
