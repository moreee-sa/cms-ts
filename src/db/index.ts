import { generateToken, hashPass, verifyHash } from '@/crypto';
import type { ApplicationPassword, LoginType, UserType } from '@/types';
import mysql, { type RowDataPacket } from 'mysql2/promise';

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = Bun.env;

export const pool = mysql.createPool({
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

export const insertUser = async (user: UserType, appPassword: ApplicationPassword) => {
  const sql: string = 'INSERT INTO `User`(`name`, `email`, `password`, `wp_app_password`, `created_at`) VALUES (?, ?, ?, ?, ?);';
  const hash: string = await hashPass(user.password);
  const valus: string[] = [user.name, user.email, hash, appPassword.password, appPassword.created]

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
  const sql: string = 'SELECT `id`, `password`, `wp_app_password`, `email` FROM `User` WHERE `email` = ?';
  const values: string[] = [user.email]

  const [result] = await pool.execute<UserRow[]>(sql ,values);

  // Se non esiste neanche un risultato l'utente non esiste
  if (result.length === 0) {
    throw new Error('USER_DOES_NOT_EXIST');
  }

  const userData = result[0]!;

  // Se la password non e' corretta lancia un errore
  if (!await verifyHash(userData.password, user.password)) {
    throw new Error('INVALID_PASSWORD');
  }

  // Genera un token
  return await generateToken({ id: userData.id, email: userData.email });
}