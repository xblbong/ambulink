// public/models/Ambulans.js
const db = require("../config/db");

class Ambulans {
  static async getAll() {
    const queryText = "SELECT * FROM ambulans WHERE active = true";
    try {
      const result = await db.query(queryText);
      return result.rows;
    } catch (error) {
      console.error("Error in Ambulans.getAll:", error);
      throw error;
    }
  }

  static async getById(id) {
    const queryText = "SELECT * FROM ambulans WHERE id = $1 AND active = true";
    const values = [id];
    try {
      const result = await db.query(queryText, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error in Ambulans.getById:", error);
      throw error;
    }
  }

  static async getNearby(lat, lng, radius) {
    const queryText = `
      SELECT *, (
        6371 * acos(
          cos(radians($1)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude))
        )
      ) AS distance
      FROM ambulans
      WHERE active = true
      HAVING (
        6371 * acos(
          cos(radians($1)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude))
        )
      ) <= $3
      ORDER BY distance
    `;
    const values = [lat, lng, radius]; // $1=lat, $2=lng, $3=radius
    try {
      const result = await db.query(queryText, values);
      return result.rows;
    } catch (error) {
      console.error("Error in Ambulans.getNearby:", error);
      throw error;
    }
  }

  static async create(ambulansData) {
    // Asumsi 'id' di tabel 'ambulans' adalah SERIAL/BIGSERIAL
    const {
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
      rating: inputRating, // rating dan jumlah_rating biasanya tidak di-set saat create
      jumlah_rating: inputJumlahRating,
    } = ambulansData;

    // Rating dan jumlah_rating biasanya dimulai dari 0 atau dihitung nanti
    const rating = inputRating !== undefined ? parseFloat(inputRating) : 0.0;
    const jumlah_rating =
      inputJumlahRating !== undefined ? parseInt(inputJumlahRating) : 0;

    // Kolom yang akan di-insert. 'id' tidak dimasukkan jika SERIAL.
    // 'active' dan 'verified' di-set default di query.
    const queryText = `
      INSERT INTO ambulans (
        nama, kontak, whatsapp, alamat, provinsi, kota, latitude, longitude,
        status, tipe_instansi, jenis_layanan, harga, fasilitas,
        jam_operasional, deskripsi, user_id, active, verified, rating, jumlah_rating,
        created_at, updated_at -- Tambahkan kolom ini
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        true, false, $17, $18,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP -- Tambahkan nilai untuk kolom tersebut
      ) RETURNING *`;

    const values = [
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
      harga === undefined || harga === null ? null : parseFloat(harga),
      fasilitas, // Jika kolom fasilitas adalah JSON/JSONB, kirim objek/array langsung
      // Jika teks, JSON.stringify(fasilitas)
      jam_operasional || null,
      deskripsi || null,
      user_id,
      rating,
      jumlah_rating,
    ];

    try {
      console.log("--- DEBUG Ambulans.create MODEL ---");
      console.log("QUERY TO BE EXECUTED:", queryText); // Ini akan menunjukkan querynya
      console.log("VALUES FOR QUERY:", values);
      console.log("DATA RECEIVED:", ambulansData);
      console.log("--- END DEBUG MODEL ---");
      const result = await db.query(queryText, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error in Ambulans.create:", error);
      console.error("Failed Query:", queryText);
      console.error("Failed Values:", values);
      throw error;
    }
  }

  static async update(id, ambulansData) {
    const fields = [];
    const values = [];
    let placeholderIndex = 1;

    for (const key in ambulansData) {
      if (ambulansData.hasOwnProperty(key) && key !== "id") {
        if (key === "fasilitas" && typeof ambulansData[key] !== "string") {
          fields.push(`${key} = $${placeholderIndex++}`);
          values.push(JSON.stringify(ambulansData[key]));
        } else if (
          key === "harga" &&
          (ambulansData[key] === undefined || ambulansData[key] === null)
        ) {
          fields.push(`${key} = $${placeholderIndex++}`);
          values.push(null);
        } else {
          fields.push(`${key} = $${placeholderIndex++}`);
          values.push(ambulansData[key]);
        }
      }
    }

    if (fields.length === 0) {
      return false;
    }

    const queryText = `
      UPDATE ambulans
      SET ${fields.join(", ")}
      WHERE id = $${placeholderIndex}
      RETURNING *`;
    values.push(id);

    try {
      const result = await db.query(queryText, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error in Ambulans.update:", error);
      throw error;
    }
  }

  static async delete(id) {
    const queryText =
      "UPDATE ambulans SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id";
    const values = [id];
    try {
      const result = await db.query(queryText, values);
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error in Ambulans.delete (soft):", error);
      throw error;
    }
  }

  static async getByProvider(providerId) {
    const queryText =
      "SELECT * FROM ambulans WHERE user_id = $1 AND active = true";
    const values = [providerId];
    try {
      const result = await db.query(queryText, values);
      return result.rows;
    } catch (error) {
      console.error("Error in Ambulans.getByProvider:", error);
      throw error;
    }
  }

  static async verify(id) {
    const queryText =
      "UPDATE ambulans SET verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id";
    const values = [id];
    try {
      const result = await db.query(queryText, values);
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error in Ambulans.verify:", error);
      throw error;
    }
  }

  static async search(filters) {
    let queryBase = "SELECT * FROM ambulans WHERE active = true";
    const conditions = [];
    const values = [];
    let placeholderIndex = 1;

    if (filters.provinsi) {
      conditions.push(`provinsi ILIKE $${placeholderIndex++}`);
      values.push(`%${filters.provinsi}%`);
    }
    if (filters.kota) {
      conditions.push(`kota ILIKE $${placeholderIndex++}`);
      values.push(`%${filters.kota}%`);
    }
    if (filters.tipe_instansi) {
      conditions.push(`tipe_instansi = $${placeholderIndex++}`);
      values.push(filters.tipe_instansi);
    }
    if (filters.jenis_layanan) {
      conditions.push(`jenis_layanan = $${placeholderIndex++}`);
      values.push(filters.jenis_layanan);
    }
    if (filters.status) {
      conditions.push(`status = $${placeholderIndex++}`);
      values.push(filters.status);
    }
    if (filters.verified !== undefined) {
      conditions.push(`verified = $${placeholderIndex++}`);
      values.push(filters.verified);
    }

    let queryText = queryBase;
    if (conditions.length > 0) {
      queryText += " AND " + conditions.join(" AND ");
    }
    queryText += " ORDER BY created_at DESC";

    try {
      const result = await db.query(queryText, values);
      return result.rows;
    } catch (error) {
      console.error("Error in Ambulans.search:", error);
      throw error;
    }
  }
}

module.exports = Ambulans;
