# Panduan Penggunaan Database AmbuLink

## Persiapan Database

1. Pastikan MySQL server sudah terinstall dan berjalan
2. Buka terminal atau command prompt
3. Login ke MySQL:
   ```bash
   mysql -u root -p
   ```
   Jika diminta password, masukkan password MySQL Anda

4. Import skema database:
   ```bash
   mysql -u root -p < db/schema.sql
   ```

## Struktur Database

### Tabel `users`
Menyimpan data pengguna yang dapat mengelola ambulans.

Kolom:
- `id`: ID unik pengguna (auto increment)
- `nama`: Nama lengkap pengguna
- `email`: Email pengguna (unik)
- `password`: Password terenkripsi (bcrypt)
- `created_at`: Waktu pembuatan akun

### Tabel `ambulans`
Menyimpan data ambulans yang tersedia.

Kolom:
- `id`: ID unik ambulans (auto increment)
- `penyedia`: Nama penyedia layanan ambulans
- `kontak`: Nomor telepon yang bisa dihubungi
- `alamat`: Alamat lengkap lokasi ambulans
- `kota`: Kota tempat ambulans beroperasi
- `latitude`: Koordinat latitude lokasi ambulans
- `longitude`: Koordinat longitude lokasi ambulans
- `harga`: Biaya layanan (0 untuk gratis)
- `status`: Status ambulans ('gratis' atau 'berbayar')
- `fasilitas`: Daftar fasilitas yang tersedia
- `user_id`: ID pengguna yang mengelola ambulans
- `created_at`: Waktu data dibuat
- `updated_at`: Waktu terakhir data diupdate

## Data Contoh

### Akun Demo
1. Administrator
   - Email: admin@ambulink.com
   - Password: admin123

2. User Demo
   - Email: user@ambulink.com
   - Password: user123

### Data Ambulans
Database sudah diisi dengan 5 data ambulans contoh di berbagai kota:
- RS Medika Ambulans (Jakarta)
- Ambulans Siaga 24 Jam (Jakarta)
- PMI Bandung (Bandung)
- Ambulans Cepat Tanggap (Yogyakarta)
- RS Sejahtera Ambulans (Surabaya)

## Query Contoh

1. Menampilkan semua ambulans dengan informasi penyedia:
   ```sql
   SELECT a.*, u.nama as nama_penyedia 
   FROM ambulans a 
   LEFT JOIN users u ON a.user_id = u.id;
   ```

2. Mencari ambulans berdasarkan kota:
   ```sql
   SELECT * FROM ambulans WHERE kota = 'Jakarta';
   ```

3. Menampilkan ambulans gratis:
   ```sql
   SELECT * FROM ambulans WHERE status = 'gratis';
   ```

4. Menampilkan ambulans dengan harga tertentu:
   ```sql
   SELECT * FROM ambulans WHERE harga <= 500000;
   ```

5. Menghitung jumlah ambulans per kota:
   ```sql
   SELECT kota, COUNT(*) as jumlah 
   FROM ambulans 
   GROUP BY kota;
   ```

## Backup dan Restore

### Backup Database
```bash
mysqldump -u root -p gis_ambulans > backup_ambulink.sql
```

### Restore Database
```bash
mysql -u root -p gis_ambulans < backup_ambulink.sql
```

## Pemeliharaan Database

1. Bersihkan data yang tidak terpakai:
   ```sql
   DELETE FROM ambulans WHERE user_id IS NULL;
   ```

2. Update status ambulans:
   ```sql
   UPDATE ambulans SET status = 'berbayar' WHERE harga > 0;
   ```

3. Optimasi tabel:
   ```sql
   OPTIMIZE TABLE ambulans, users;
   ```

## Keamanan

1. Password disimpan dalam bentuk hash menggunakan bcrypt
2. Foreign key constraint mencegah data ambulans tanpa pemilik
3. Validasi input dilakukan di level aplikasi dan database
4. Penggunaan prepared statements untuk mencegah SQL injection

## Troubleshooting

1. Jika gagal koneksi:
   - Periksa service MySQL berjalan
   - Periksa kredensial di file `.env`
   - Pastikan database `gis_ambulans` sudah dibuat

2. Jika gagal login:
   - Pastikan email terdaftar
   - Password case sensitive
   - Periksa tabel `users` untuk memastikan data ada

3. Jika gagal menambah ambulans:
   - Pastikan semua field required terisi
   - Periksa koneksi ke database
   - Validasi format data (koordinat, nomor telepon) 