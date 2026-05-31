import { LoginSchema, UserSchema, type LoginType, type UserType } from '@/types';
import type { Request, Response } from 'express';
import { handleError } from '@/routes/errors';
import { config } from '@/lib';
import { type ApplicationPassword } from '@/types';
import { getUser, insertUser } from '@/db';
import { createWPApplicationPassword, createWPUser, deleteWPUser } from '@/routes/wordpress';

// Questa funzione consiste nel creare l'utente in WordPress, prendere il suo ID e creare la password dell'applicazione e viene salvato in un database SQL a parte
export const createUser = async (req: Request, res: Response) => {
  const userData: UserType = req.body;

  if (!userData) {
    return res.json({
      success: false,
      error: "La richiesta non e' stata effettuata correttamente"
    }).sendStatus(400);
  };

  try {
    const parseUserData = UserSchema.parse({
      name: userData.name,
      email: userData.email,
      password: userData.password
    });

    // Effettua il fetch verso wordpress per creare l'utente utilizzando le credenziali admin
    // Per effettuare questo fetch e' necessario utilizzare HTTPS e non HTTP
    const wpUser = await createWPUser(parseUserData);

    // Se l'utente non esiste viene creato e poi prendi il suo ID
    const appPassword = await createWPApplicationPassword(wpUser.id);

    // Prova ad inserirlo nel database, se fallisce allora elimina l'utente su wordpress
    try {
      await insertUser(parseUserData, appPassword);
    } catch (error) {
      // Per transazioni di tipo ACID
      await deleteWPUser(wpUser.id);
      return res.status(500).json({ success: false, message: "Errore durante la registrazione sul database" });
    }

    return res.status(201).json({ success: true });
  } catch (error) {
    console.log(error);
    return handleError(error, res);
  }
}

// Funzione che si occupa del login dell'utente
export const loginUser = async (req: Request, res: Response) => {
  const userData: LoginType = req.body;

  if (!userData) {
    return res.json({
      success: false,
      error: "La richiesta non e' stata effettuata correttamente"
    }).sendStatus(400);
  };

  try {
    const parseLoginUserData = LoginSchema.parse({
      email: userData.email,
      password: userData.password
    });

    const token = await getUser(parseLoginUserData);

    res.status(200).cookie('token', token, { httpOnly: true }).json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_DOES_NOT_EXIST') {
      return res.status(404).json({ success: false, message: "Utente non trovato" });
    }

    if (error instanceof Error && error.message === 'INVALID_PASSWORD') {
      return res.status(404).json({ success: false, message: "Credenziali non valide" });
    }

    return handleError(error, res);
  }
}