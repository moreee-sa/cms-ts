import * as argon2 from 'argon2';

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