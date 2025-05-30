const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ambulansController = require('../controllers/ambulansController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Validasi untuk ambulans
const ambulansValidation = [
    body('nama').notEmpty().withMessage('Nama ambulans harus diisi'),
    body('tipe_instansi').isIn(['rumah_sakit', 'pmi', 'klinik', 'lainnya'])
        .withMessage('Tipe instansi tidak valid'),
    body('jenis_layanan').isIn(['gawat_darurat', 'non_gawat_darurat', 'jenazah'])
        .withMessage('Jenis layanan tidak valid'),
    body('status').isIn(['gratis', 'berbayar'])
        .withMessage('Status tidak valid'),
    body('harga').optional().isNumeric()
        .withMessage('Harga harus berupa angka'),
    body('provinsi').notEmpty()
        .withMessage('Provinsi harus diisi'),
    body('kota').notEmpty()
        .withMessage('Kota harus diisi'),
    body('alamat').notEmpty()
        .withMessage('Alamat harus diisi'),
    body('latitude').isFloat({ min: -90, max: 90 })
        .withMessage('Latitude tidak valid'),
    body('longitude').isFloat({ min: -180, max: 180 })
        .withMessage('Longitude tidak valid'),
    body('kontak').notEmpty()
        .withMessage('Kontak harus diisi')
        .matches(/^[0-9+\-() ]+$/)
        .withMessage('Format nomor kontak tidak valid'),
    body('whatsapp').optional()
        .matches(/^[0-9+\-() ]+$/)
        .withMessage('Format nomor WhatsApp tidak valid'),
    body('fasilitas').optional()
        .isString()
        .withMessage('Fasilitas harus berupa teks'),
    body('deskripsi').optional()
        .isString()
        .withMessage('Deskripsi harus berupa teks'),
    body('jam_operasional').optional()
        .isString()
        .withMessage('Jam operasional harus berupa teks')
];

// Public routes
router.get('/', ambulansController.getAllAmbulans);
router.get('/search', ambulansController.searchAmbulans);
router.get('/nearby', ambulansController.getNearbyAmbulans);
router.get('/:id', ambulansController.getAmbulansById);

// Protected routes
router.use(auth); // Middleware authentication untuk routes di bawah ini

// Provider & Admin routes
router.post('/', 
    checkRole(['provider', 'admin']),
    ambulansValidation,
    ambulansController.createAmbulans
);

router.put('/:id',
    checkRole(['provider', 'admin']),
    ambulansValidation,
    ambulansController.updateAmbulans
);

router.delete('/:id',
    checkRole(['provider', 'admin']),
    ambulansController.deleteAmbulans
);

// Admin only routes
router.patch('/:id/verify',
    checkRole(['admin']),
    ambulansController.verifyAmbulans
);

module.exports = router; 