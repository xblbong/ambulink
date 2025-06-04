const db = require("../config/db");

class Ambulans {
  static async getAll() {
    try {
      const [rows] = await db.query("SELECT * FROM ambulans WHERE active = true");
      return rows;
    } catch (error) {
      console.error("Error in getAll:", error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query(
        "SELECT * FROM ambulans WHERE id = ? AND active = true",
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error("Error in getById:", error);
      throw error;
    }
  }

  static async getNearby(lat, lng, radius) {
    try {
      const query = `
        SELECT *, (
          6371 * acos(
            cos(radians(?)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians(?)) +
            sin(radians(?)) * sin(radians(latitude))
          )
        ) AS distance
        FROM ambulans
        WHERE active = true
        HAVING distance <= ?
        ORDER BY distance
      `;

      const [rows] = await db.query(query, [lat, lng, lat, radius]);
      return rows;
    } catch (error) {
      console.error("Error in getNearby:", error);
      throw error;
    }
  }

  static async create(ambulansData) {
    try {
      const {
        id,
        nama,
        kontak,
        whatsapp,
        alamat,
        provinsi,
        kota,
        latitude,
        longitude,
        status,
        tipe_instansi,
        jenis_layanan,
        harga,
        fasilitas,
        jam_operasional,
        deskripsi,
        user_id,
        rating: inputRating,
        jumlah_rating,
      } = ambulansData;

      const rating = inputRating !== undefined ? inputRating : 0;

      const [result] = await db.query(
        `INSERT INTO ambulans (
          id, nama, kontak, whatsapp, alamat, provinsi,
          kota, latitude, longitude, status,
          tipe_instansi, jenis_layanan, harga,
          fasilitas, jam_operasional, deskripsi,
          user_id, active, verified, rating, jumlah_rating
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, false, ?, ?)`,
        [
          id,
          nama,
          kontak,
          whatsapp || null,
          alamat,
          provinsi,
          kota,
          latitude,
          longitude,
          status,
          tipe_instansi,
          jenis_layanan,
          harga || 0,
          JSON.stringify(fasilitas),
          jam_operasional || null,
          deskripsi || null,
          user_id,
          rating,
          jumlah_rating,
        ]
      );

      return result.insertId;
    } catch (error) {
      console.error("Error in create:", error);
      throw error;
    }
  }

  static async update(id, ambulansData) {
    try {
      const [result] = await db.query("UPDATE ambulans SET ? WHERE id = ?", [
        ambulansData,
        id,
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error in update:", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query(
        "UPDATE ambulans SET active = false WHERE id = ?",
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error in delete:", error);
      throw error;
    }
  }

  static async getByProvider(providerId) {
    try {
      const [rows] = await db.query(
        "SELECT * FROM ambulans WHERE provider_id = ? AND active = true",
        [providerId]
      );
      return rows;
    } catch (error) {
      console.error("Error in getByProvider:", error);
      throw error;
    }
  }

  static async verify(id) {
    try {
      const [result] = await db.query(
        "UPDATE ambulans SET verified = true WHERE id = ?",
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error in verify:", error);
      throw error;
    }
  }

  static async search(filters) {
    try {
      let query = "SELECT * FROM ambulans WHERE active = true";
      const values = [];

      if (filters.provinsi) {
        query += " AND provinsi = ?";
        values.push(filters.provinsi);
      }

      if (filters.kota) {
        query += " AND kota = ?";
        values.push(filters.kota);
      }

      if (filters.tipe_instansi) {
        query += " AND tipe_instansi = ?";
        values.push(filters.tipe_instansi);
      }

      if (filters.jenis_layanan) {
        query += " AND jenis_layanan = ?";
        values.push(filters.jenis_layanan);
      }

      if (filters.status) {
        query += " AND status = ?";
        values.push(filters.status);
      }

      if (filters.verified !== undefined) {
        query += " AND verified = ?";
        values.push(filters.verified);
      }

      const [rows] = await db.query(query, values);
      return rows;
    } catch (error) {
      console.error("Error in search:", error);
      throw error;
    }
  }
}

module.exports = Ambulans;
