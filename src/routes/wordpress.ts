import { config } from "@/lib";
import type { Request, Response } from 'express';
import { PostSchema, type ApplicationPassword, type PostType, type UserType } from '@/types';
import { handleError } from "@/routes/errors";
import { getWPPasswordByUserId } from "@/db";

// Autenticazione <nome-utente>:<API password> in base64
const auth64 = btoa(`${config.wp.adminUsername}:${config.wp.adminPassword}`);

// Questo file si occupa di gestire il fetch dei dati su WordPress

export const getPosts = async (req: Request, res: Response) => {
  try {
    // Effettua un fetch verso WordPress per recuperare tutti i post
    const response = await fetch(`${config.wp.baseUrl}/posts`, {
      tls: {
        rejectUnauthorized: false
      }
    });
  
    // Se il server risponde, prendi il suo contenuto
    if (response.status == 200) {
      const posts = await response.json();
  
      return res.json(posts);
    };

    return res.sendStatus(response.status);
  } catch (error) {
    console.error("Errore di connessione a Wordpress");
    return res.sendStatus(500);
  }
}

export const createPost = async (req: Request, res: Response) => {
  // Verifica se il contenuto dell'articolo e' stato ricevuto
  const postData: PostType = req.body;
  if (!postData) {
    return res.status(400).json({
      success: false,
      error: "La richiesta non e' stata effettuata correttamente"
    })
  };
  
  try {
    // Prendi l'id dal token
    const userAuth = req.user as { id: number };

    // Validazione dei dati
    const parsePostData = PostSchema.parse({
      title: postData.title,
      content: postData.content,
      status: postData.status,
    });

    // Recupera la password dell'applicazione dal database
    const userData = await getWPPasswordByUserId(userAuth.id);
    const authUser = btoa(`${userData.wp_username}:${userData.wp_app_password}`);

    // Esegui il fetch dei dati
    const response = await fetch(`${config.wp.baseUrl}/posts`, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${authUser}`
      },
      body: JSON.stringify({
        title: parsePostData.title,
        content: parsePostData.content,
        status: parsePostData.status
      }),
      tls: { rejectUnauthorized: false }
    });

    if (response.status != 201) {
      const data = await response.json() as { code: string, message: string };
      throw new Error(data.message);
    }

    console.log(response.status)
    console.log(response.body)

    return res.status(201).json({
      success: true,
      message: "Post creato correttamente"
    });
  } catch (error) {
    handleError(error, res);
  }
}

export const createWPUser = async (userData: UserType, wp_username: string) => {
  const response = await fetch(`${config.wp.baseUrl}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth64}`
    },
    body: JSON.stringify({
      username: wp_username,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      roles: ['author']
    }),
    tls: { rejectUnauthorized: false }
  });

  if (response.status !== 201) {
    const data = await response.json() as { code: string, message: string };
    throw new Error(data.message);
  }

  return await response.json() as { id: number };
}

export const createWPApplicationPassword = async (userId: number) => {
  const response = await fetch(`${config.wp.baseUrl}/users/${userId}/application-passwords`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth64}`
    },
    body: JSON.stringify({ name: 'user-api-cms' }),
    tls: { rejectUnauthorized: false }
  });

  if (response.status !== 201) {
    const data = await response.json() as { code: string, message: string };
    throw new Error(data.message);
  }

  return await response.json() as ApplicationPassword;
}

export const deleteWPUser = async (userId: number) => {
  const response = await fetch(`${config.wp.baseUrl}/users/${userId}?force=true&reassign=1`, {
    method: 'DELETE',
    headers: { 'Authorization': `Basic ${auth64}` },
    tls: { rejectUnauthorized: false }
  });

  if (!response.ok) {
    const data = await response.json() as { code: string, message: string };
    throw new Error(data.message);
  }
}