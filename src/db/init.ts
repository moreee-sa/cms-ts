import { pool } from '@/db';

const initDb = async () => {
  const conn = await pool.getConnection();

  const createUser = `
    CREATE TABLE IF NOT EXISTS User (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      wp_app_password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  try {
    await conn.query(createUser);
  } catch (err) {
    console.error(err);
  } finally {
    conn.release();
    await pool.end();
  }
}

await initDb();