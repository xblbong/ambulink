const db = require('../config/db');

async function createReviewsTable() {
  try {
    // Check if table exists
    const [tables] = await db.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'reviews'
    `);

    if (tables.length === 0) {
      // Create table if it doesn't exist
      await db.query(`
        CREATE TABLE reviews (
          id VARCHAR(36) PRIMARY KEY,
          ambulans_id INT NOT NULL,
          user_id VARCHAR(36) NOT NULL,
          rating INT NOT NULL,
          komentar TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ambulans_id) REFERENCES ambulans(id),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);
      console.log('Reviews table created successfully');
    } else {
      // Alter existing table to use UUID
      try {
        await db.query(`
          ALTER TABLE reviews 
          MODIFY COLUMN id VARCHAR(36),
          MODIFY COLUMN user_id VARCHAR(36)
        `);
        console.log('Reviews table updated to use UUID');
      } catch (alterErr) {
        console.log('Table already using UUID or modification not needed');
      }
      
      // Get table structure
      const [columns] = await db.query(`
        SHOW COLUMNS FROM reviews
      `);
      console.log('Existing reviews table structure:', columns);
    }
  } catch (err) {
    console.error('Error in reviews migration:', err);
    throw err;
  }
}

module.exports = createReviewsTable; 