import { LoginSchema, UserSchema, type LoginType, type UserType } from '@/types';
import type { Request, Response } from 'express';
import { handleError } from '@/routes/errors';
import { config } from '@/lib';
import { type ApplicationPassword } from '@/types';
import { getUser, insertUser } from '@/db';

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

    // Autenticazione <nome-utente>:<API password> in bae64
    const auth64 = btoa(`${config.wp.adminUsername}:${config.wp.adminPassword}`);

    // Effettua il fetch verso wordpress per creare l'utente utilizzando le credenziali admin
    // Per effettuare questo fetch e' necessario utilizzare HTTPS e non HTTP
    const response = await fetch(`${config.wp.baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth64}`
      },
      body: JSON.stringify({
        username: crypto.randomUUID(), // L'username e' univoco, mentre il nome puo' essere cambiato
        name: userData.name,
        email: userData.email,
        password: userData.password,
        roles: ['author']
      }),
      tls: {
        rejectUnauthorized: false // ignora certificato self-signed in locale
      }
    })

    // Se la risposta e' diversa da 201, allora vuol dire che c'e' stato qualche problema
    if (response.status !== 201) {
      const data = await response.json() as { code: string, message: string };
      
      return res.status(409).json({
        code: data.code,
        message: data.message
      });
    }

    // Se l'utente non esiste viene creato e poi prendi il suo ID
    const wpUser = await response.json() as { id: number };

    const applicationPassResponse = await fetch(`${config.wp.baseUrl}/users/${wpUser.id}/application-passwords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth64}`
      },
      body: JSON.stringify({
        name: 'user-api-cms'
      }),
      tls: {
        rejectUnauthorized: false
      }
    });

    // Se la "password dell'applicazione" viene creata correttamente, crea l'utente e inserisci la password dell'applicazione nel database
    if (applicationPassResponse.status !== 201) {
      const data = await applicationPassResponse.json() as { code: string, message: string };
      return res.status(applicationPassResponse.status).json({ success: false, message: data.message });
    }

    const dataApplicationPassword = await applicationPassResponse.json() as ApplicationPassword;

    await insertUser(parseUserData, dataApplicationPassword);

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