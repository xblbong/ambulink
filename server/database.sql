-- Create database
CREATE DATABASE IF NOT EXISTS gis_ambulans;
USE gis_ambulans;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create ambulans table
CREATE TABLE IF NOT EXISTS ambulans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    tipe_instansi ENUM('rs', 'puskesmas', 'klinik', 'lainnya') NOT NULL,
    jenis_layanan ENUM('gawat_darurat', 'non_gawat_darurat', 'transportasi', 'jenazah') NOT NULL,
    status ENUM('gratis', 'berbayar') NOT NULL,
    harga DECIMAL(10,2),
    provinsi VARCHAR(50) NOT NULL,
    kota VARCHAR(50) NOT NULL,
    alamat TEXT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    kontak VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20),
    fasilitas TEXT,
    deskripsi TEXT,
    jam_operasional VARCHAR(100),
    user_id INT,
    verified BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    rating DECIMAL(2,1) DEFAULT 0,
    jumlah_rating INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ambulans_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    komentar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ambulans_id) REFERENCES ambulans(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
); 