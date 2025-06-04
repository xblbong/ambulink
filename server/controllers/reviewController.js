const Review = require('../models/reviewModel');

exports.getReviewsByAmbulans = async (req, res) => {
  try {
    const reviews = await Review.findByAmbulansId(req.params.ambulans_id);
    if (!reviews || reviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found' });
    }
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

exports.addReview = async (req, res) => {
  const { ambulans_id, rating, komentar } = req.body;
  const user_id = req.user.id;

  try {
    await Review.create({ ambulans_id, user_id, rating, komentar });
    await Review.updateRating(ambulans_id);
    res.status(201).json({ 
      message: 'Review berhasil disimpan',
      success: true 
    });
  } catch (err) {
    console.error('Gagal tambah review:', err);
    res.status(500).json({ 
      message: 'Gagal simpan review',
      error: err.message 
    });
  }
};