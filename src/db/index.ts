import type { ApplicationPassword, LoginType, UserType } from '@/types';
import mysql, { type RowDataPacket } from 'mysql2/promise';

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = Bun.env;

const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

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

  const createToken = `
    CREATE TABLE IF NOT EXISTS Token (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      revoked BOOLEAN DEFAULT FALSE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES User(id)
    )
  `;

  try {
    await conn.query(createUser);
    await conn.query(createToken);
  } catch (err) {
    console.error(err);
  } finally {
    conn.release();
  }
}

await initDb();

export const insertUser = async (user: UserType, appPassword: ApplicationPassword) => {
  const sql: string = 'INSERT INTO `User`(`name`, `email`, `password`, `wp_app_password`, `created_at`) VALUES (?, ?, ?, ?, ?);';
  const valus: string[] = [user.name, user.email, user.password, appPassword.password, appPassword.created]

  const [result, fields] = await pool.execute(sql, valus);
  return result
}

interface UserRow extends RowDataPacket {
  id: number;
  // name: string;
  // email: string;
  password: string;
  wp_app_password: string;
};

export const getUser = async (user: LoginType) => {
  const sql: string = 'SELECT `id`, `password`, `wp_app_password` FROM `User` WHERE `email` = ?';
  const values: string[] = [user.email]

  const [result] = await pool.execute<UserRow[]>(sql ,values);

  // Se non esiste neanche un risultato l'utente non esiste
  if (result.length === 0) {
    throw new Error('USER_DOES_NOT_EXIST');
  }

  const userData = result[0]!;

  // E' necessario argon2 per verificare la password
  if (user.password == userData.password) {
    // Se l'utente e' effettivamente lui, genera un token
    const sql: string = ''
  }
}