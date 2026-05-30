import { UserSchema, type UserType } from '@/types';
import type { Request, Response } from 'express';
import { handleError } from '@/routes/errors';
import { config } from '@/lib';

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

    const response = await fetch(`${config.wp.baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth64}`
      },
      body: JSON.stringify({
        username: userData.name,
        email: userData.email,
        password: userData.password,
        roles: ['author']
      }),
      tls: {
        rejectUnauthorized: false // ignora certificato self-signed in locale
      }
    })

    console.log(await response.json())
    if (response.status == 200) {
      const wpUser = await response.json();
      console.log(wpUser);
    }


  } catch (error) {
    return handleError(error, res);
  }

  return res.sendStatus(200);
}