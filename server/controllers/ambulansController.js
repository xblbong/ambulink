const { v4: uuidv4 } = require("uuid");
const Ambulans = require("../models/Ambulans");
const { validationResult } = require("express-validator");

const generateUniqueIntId = () => {
  return Math.floor(Math.random() * 1000000000);
};

const ambulansController = {
  getAllAmbulans: async (req, res) => {
    try {
      const ambulans = await Ambulans.getAll();
      res.json(ambulans);
    } catch (error) {
      res.status(500).json({
        message: "Terjadi kesalahan saat mengambil data ambulans",
        error: error.message,
      });
    }
  },

  getAmbulansById: async (req, res) => {
    try {
      const ambulans = await Ambulans.getById(req.params.id);
      if (!ambulans) {
        return res.status(404).json({ message: "Ambulans tidak ditemukan" });
      }
      res.json(ambulans);
    } catch (error) {
      res.status(500).json({
        message: "Terjadi kesalahan saat mengambil data ambulans",
        error: error.message,
      });
    }
  },

  getNearbyAmbulans: async (req, res) => {
    try {
      const { lat, lng, radius = 5 } = req.query;
      if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude dan longitude diperlukan" });
      }
      const ambulans = await Ambulans.getNearby(parseFloat(lat), parseFloat(lng), parseFloat(radius));
      res.json(ambulans);
    } catch (error) {
      res.status(500).json({
        message: "Terjadi kesalahan saat mencari ambulans terdekat",
        error: error.message,
      });
    }
  },

  searchAmbulans: async (req, res) => {
    try {
      const ambulans = await Ambulans.search(req.query);
      res.json(ambulans);
    } catch (error) {
      res.status(500).json({
        message: "Terjadi kesalahan saat mencari ambulans",
        error: error.message,
      });
    }
  },

  createAmbulans: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let ambulansID = generateUniqueIntId();
      while (await Ambulans.getById(ambulansID)) {
        ambulansID = generateUniqueIntId();
      }

      const ambulansData = {
        ...req.body,
        id: ambulansID,
        user_id: req.user?.id,
        jumlah_rating: 0,
      };

      const ambulansId = await Ambulans.create(ambulansData);

      res.status(201).json({
        message: "Ambulans berhasil ditambahkan",
        ambulansId,
      });
    } catch (error) {
      res.status(500).json({
        message: "Terjadi kesalahan saat menambahkan ambulans",
        error: error.message,
      });
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
        return res.status(404).json({ message: "Ambulans tidak ditemukan" });
      }

      res.json({ message: "Ambulans berhasil diperbarui" });
    } catch (error) {
      res.status(500).json({
        message: "Terjadi kesalahan saat memperbarui ambulans",
        error: error.message,
      });
    }
  },

  deleteAmbulans: async (req, res) => {
    try {
      const deleted = await Ambulans.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Ambulans tidak ditemukan" });
      }

      res.json({ message: "Ambulans berhasil dihapus" });
    } catch (error) {
      res.status(500).json({
        message: "Terjadi kesalahan saat menghapus ambulans",
        error: error.message,
      });
    }
  },

  verifyAmbulans: async (req, res) => {
    try {
      const verified = await Ambulans.verify(req.params.id);
      if (!verified) {
        return res.status(404).json({ message: "Ambulans tidak ditemukan" });
      }

      res.json({ message: "Ambulans berhasil diverifikasi" });
    } catch (error) {
      res.status(500).json({
        message: "Terjadi kesalahan saat memverifikasi ambulans",
        error: error.message,
      });
    }
  },
};

module.exports = ambulansController;
