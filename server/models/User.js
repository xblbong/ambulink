const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    static async findByEmail(email) {
        try {
            const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            return rows[0];
        } catch (error) {
            console.error('Error in findByEmail:', error);
            throw error;
        }
    }

    static async create(userData) {
        try {
            const { nama, email, password } = userData;
            
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            const [result] = await db.query(
                'INSERT INTO users (nama, email, password) VALUES (?, ?, ?)',
                [nama, email, hashedPassword]
            );
            
            return result.insertId;
        } catch (error) {
            console.error('Error in create:', error);
            throw error;
        }
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error('Error in verifyPassword:', error);
            throw error;
        }
    }
}

module.exports = User; 