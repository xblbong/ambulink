const Review = require('../models/reviewModel');

exports.getReviewsByAmbulans = async (req, res) => {
  try {
    const [reviews] = await Review.findByAmbulansId(req.params.ambulans_id);
    res.json(reviews || []);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ 
      message: 'Error fetching reviews',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { ambulans_id, rating, komentar } = req.body;
    const user_id = req.user.id;

    // Debug logging
    console.log('Adding review with data:', {
      ambulans_id,
      user_id,
      rating,
      komentar
    });

    // Validate input
    if (!ambulans_id || !user_id) {
      return res.status(400).json({ 
        message: 'ID ambulans dan user harus diisi',
        success: false 
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: 'Rating harus antara 1-5',
        success: false 
      });
    }

    // Check if user has already reviewed this ambulance
    const [existingReviews] = await Review.findByUserAndAmbulans(user_id, ambulans_id);
    
    // Debug logging
    console.log('Existing reviews:', existingReviews);
    
    if (existingReviews && existingReviews.length > 0) {
      return res.status(400).json({
        message: 'Anda sudah memberikan review untuk ambulans ini',
        success: false
      });
    }

    // Create review
    const [result] = await Review.create({ 
      ambulans_id: parseInt(ambulans_id), 
      user_id: parseInt(user_id), 
      rating: parseInt(rating), 
      komentar: komentar || "" 
    });

    // Debug logging
    console.log('Review creation result:', result);

    // Update ambulance rating
    await Review.updateRating(ambulans_id);

    res.status(201).json({ 
      message: 'Review berhasil disimpan',
      success: true 
    });
  } catch (err) {
    console.error('Gagal tambah review:', {
      error: err,
      message: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage,
      sql: err.sql
    });
    
    // Handle specific database errors
    if (err.code === 'ER_NO_DEFAULT_FOR_FIELD') {
      return res.status(500).json({
        message: 'Terjadi kesalahan pada struktur data',
        success: false,
        details: process.env.NODE_ENV === 'development' ? {
          error: err.message,
          sql: err.sql
        } : undefined
      });
    }
    
    res.status(500).json({ 
      message: 'Gagal menyimpan review. Silakan coba lagi.',
      success: false,
      details: process.env.NODE_ENV === 'development' ? {
        error: err.message,
        sql: err.sql
      } : undefined
    });
  }
};