const Ambulans = require('../models/Ambulans');
const { validationResult } = require('express-validator');

const ambulansController = {
  getAllAmbulans: async (req, res) => {
    try {
      const ambulans = await Ambulans.getAll();
      console.log('Retrieved ambulans data:', ambulans); // Debug log
      res.json(ambulans);
    } catch (error) {
      console.error('Error getting ambulans:', error);
      // Send more detailed error message
      res.status(500).json({ 
        message: 'Terjadi kesalahan saat mengambil data ambulans',
        error: error.message,
        code: error.code
      });
    }
  },

  getAmbulansById: async (req, res) => {
    try {
      const ambulans = await Ambulans.getById(req.params.id);
      if (!ambulans) {
        return res.status(404).json({ message: 'Ambulans tidak ditemukan' });
      }
      res.json(ambulans);
    } catch (error) {
      console.error('Error getting ambulans by id:', error);
      res.status(500).json({ 
        message: 'Terjadi kesalahan saat mengambil data ambulans',
        error: error.message
      });
    }
  },

  getNearbyAmbulans: async (req, res) => {
    try {
      const { lat, lng, radius = 5 } = req.query;
      if (!lat || !lng) {
        return res.status(400).json({ message: 'Latitude dan longitude diperlukan' });
      }
      const ambulans = await Ambulans.getNearby(parseFloat(lat), parseFloat(lng), parseFloat(radius));
      res.json(ambulans);
    } catch (error) {
      console.error('Error getting nearby ambulans:', error);
      res.status(500).json({ 
        message: 'Terjadi kesalahan saat mencari ambulans terdekat',
        error: error.message
      });
    }
  },

  searchAmbulans: async (req, res) => {
    try {
      console.log('Search query:', req.query); // Debug log
      const ambulans = await Ambulans.search(req.query);
      console.log('Search results:', ambulans); // Debug log
      res.json(ambulans);
    } catch (error) {
      console.error('Error searching ambulans:', error);
      res.status(500).json({ 
        message: 'Terjadi kesalahan saat mencari ambulans',
        error: error.message
      });
    }
  },

  createAmbulans: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const ambulansId = await Ambulans.create({
        ...req.body,
        user_id: req.user?.id // dari JWT payload, optional chaining untuk menghindari error
      });

      res.status(201).json({
        message: 'Ambulans berhasil ditambahkan',
        ambulansId
      });
    } catch (error) {
      console.error('Error creating ambulans:', error);
      res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan ambulans' });
    }
  },

  updateAmbulans: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const updated = await Ambulans.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: 'Ambulans tidak ditemukan' });
      }

      res.json({ message: 'Ambulans berhasil diperbarui' });
    } catch (error) {
      console.error('Error updating ambulans:', error);
      res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui ambulans' });
    }
  },

  deleteAmbulans: async (req, res) => {
    try {
      const deleted = await Ambulans.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Ambulans tidak ditemukan' });
      }

      res.json({ message: 'Ambulans berhasil dihapus' });
    } catch (error) {
      console.error('Error deleting ambulans:', error);
      res.status(500).json({ message: 'Terjadi kesalahan saat menghapus ambulans' });
    }
  },

  verifyAmbulans: async (req, res) => {
    try {
      const verified = await Ambulans.verify(req.params.id);
      if (!verified) {
        return res.status(404).json({ message: 'Ambulans tidak ditemukan' });
      }

      res.json({ message: 'Ambulans berhasil diverifikasi' });
    } catch (error) {
      console.error('Error verifying ambulans:', error);
      res.status(500).json({ message: 'Terjadi kesalahan saat memverifikasi ambulans' });
    }
  }
};

module.exports = ambulansController; 