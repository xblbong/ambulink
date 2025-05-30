-- Create database
DROP DATABASE IF EXISTS gis_ambulans;
CREATE DATABASE gis_ambulans;
USE gis_ambulans;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create ambulans table
CREATE TABLE ambulans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    kontak VARCHAR(20) NOT NULL,
    alamat TEXT NOT NULL,
    provinsi VARCHAR(100) NOT NULL,
    kota VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status ENUM('gratis', 'berbayar') NOT NULL,
    tipe_instansi ENUM('rs', 'puskesmas', 'klinik', 'lainnya') NOT NULL,
    jenis_layanan ENUM('gawat_darurat', 'transportasi', 'lainnya') NOT NULL DEFAULT 'gawat_darurat',
    harga INT DEFAULT 0,
    fasilitas JSON NOT NULL,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert demo data
INSERT INTO users (nama, email, password) VALUES
('Admin Demo', 'admin@demo.com', '$2b$10$8KzcqVCq.xH.6qh5QLnZC.B7KgERCR0h3kN33T8muzkqzqcC7yJXK'), -- password: admin123
('User Demo', 'user@demo.com', '$2b$10$8KzcqVCq.xH.6qh5QLnZC.B7KgERCR0h3kN33T8muzkqzqcC7yJXK'); -- password: user123

-- Insert ambulans demo data
INSERT INTO ambulans (nama, kontak, alamat, provinsi, kota, latitude, longitude, status, tipe_instansi, jenis_layanan, harga, fasilitas, user_id) VALUES
('RS Medika Ambulans', '081234567890', 'Jl. Raya No. 1', 'DKI Jakarta', 'Jakarta Selatan', -6.2088, 106.8456, 'berbayar', 'rs', 'gawat_darurat', 500000, '["oksigen", "stretcher", "medkit"]', 1),
('PMI Jakarta', '082345678901', 'Jl. Kramat Raya No. 47', 'DKI Jakarta', 'Jakarta Pusat', -6.2006, 106.8535, 'gratis', 'lainnya', 'gawat_darurat', 0, '["oksigen", "stretcher", "medkit", "defibrillator"]', 1),
('Ambulans Gratis Bandung', '083456789012', 'Jl. Asia Afrika No. 10', 'Jawa Barat', 'Bandung', -6.9175, 107.6191, 'gratis', 'puskesmas', 'transportasi', 0, '["oksigen", "stretcher"]', 2),
('RS Premier Ambulans', '084567890123', 'Jl. Gatot Subroto No. 20', 'Jawa Timur', 'Surabaya', -7.2575, 112.7521, 'berbayar', 'rs', 'gawat_darurat', 750000, '["oksigen", "stretcher", "ventilator", "defibrillator", "medkit"]', 2),
('Ambulans 24 Jam', '085678901234', 'Jl. Sudirman No. 5', 'Sumatera Utara', 'Medan', 3.5952, 98.6722, 'berbayar', 'klinik', 'transportasi', 600000, '["oksigen", "stretcher", "medkit", "ventilator"]', 1); 