import { config } from '@/lib';
import * as argon2 from 'argon2';
import { SignJWT } from 'jose';

export const hashPass = async (password: string) => {
  const hash: string = await argon2.hash(password);
  return hash;
};

export const verifyHash = async (hash: string, password: string) => {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    console.error("Errore verifica password");
    return false;
  }
};

type UserJWT = {
  id: number;
  email: string;
}

export const generateToken = async (user: UserJWT) => {
  const secret = new TextEncoder().encode(config.jwt.secret);
  
  return await new SignJWT({ id: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .setIssuedAt()
    .sign(secret);
}