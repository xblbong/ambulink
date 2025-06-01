module.exports = (req, res, next) => {
  const { ambulans_id, rating } = req.body;

  if (!ambulans_id || !rating) {
    return res.status(400).json({ 
      message: 'Semua field wajib diisi',
      details: {
        missing_fields: {
          ambulans_id: !ambulans_id,
          rating: !rating
        }
      }
    });
  }

  if (isNaN(rating)) {
    return res.status(400).json({ message: 'Rating harus berupa angka' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating harus antara 1 dan 5' });
  }

  next();
};