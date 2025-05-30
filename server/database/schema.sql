-- Create database if not exists
CREATE DATABASE IF NOT EXISTS ambulink;
USE ambulink;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    no_telp VARCHAR(15),
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create ambulans table
CREATE TABLE IF NOT EXISTS ambulans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(100) NOT NULL,
    kontak VARCHAR(15) NOT NULL,
    alamat TEXT NOT NULL,
    provinsi VARCHAR(50) NOT NULL,
    kota VARCHAR(50) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    status ENUM('gratis', 'berbayar') NOT NULL,
    tipe_instansi ENUM('rs', 'puskesmas', 'klinik', 'lainnya') NOT NULL,
    jenis_layanan ENUM('gawat_darurat', 'transportasi', 'lainnya') NOT NULL,
    harga INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create fasilitas table
CREATE TABLE IF NOT EXISTS fasilitas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama_fasilitas VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create junction table for ambulans and fasilitas
CREATE TABLE IF NOT EXISTS ambulans_fasilitas (
    ambulans_id INT,
    fasilitas_id INT,
    PRIMARY KEY (ambulans_id, fasilitas_id),
    FOREIGN KEY (ambulans_id) REFERENCES ambulans(id) ON DELETE CASCADE,
    FOREIGN KEY (fasilitas_id) REFERENCES fasilitas(id) ON DELETE CASCADE
);

-- Insert default facilities
INSERT INTO fasilitas (nama_fasilitas, icon) VALUES
    ('oksigen', 'fa-lungs'),
    ('stretcher', 'fa-bed'),
    ('ventilator', 'fa-wind'),
    ('defibrillator', 'fa-heartbeat'),
    ('medkit', 'fa-medkit')
ON DUPLICATE KEY UPDATE icon = VALUES(icon); 