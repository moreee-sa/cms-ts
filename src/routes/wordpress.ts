import { config } from "@/lib";
import type { Request, Response } from 'express';
import { PostSchema, type PostType } from '@/types';
import z from 'zod';

export const getPosts = async (req: Request, res: Response) => {
  try {
    // Effettua un fetch verso WordPress per recuperare tutti i post
    const response = await fetch(`${config.wp.baseUrl}/posts`);
  
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

export const insertPost = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  // Verifica se l'autenticazione esiste o meno
  if (!authHeader) {
    return res.json({
      success: false,
      error: "Autenticazione mancante"
    }).sendStatus(401);
  };

  // Verifica se il contenuto dell'articolo e' stato ricevuto
  const postData: PostType = req.body;
  if (!postData) {
    return res.json({
      success: false,
      error: "La richiesta non e' stata effettuata correttamente"
    }).sendStatus(400);
  }

  try {
    // Validazione dei dati
    const parsePostData = PostSchema.parse({
      title: postData.title,
      content: postData.content,
      status: postData.status,
    });

    // Clone fortemente tipizzato dei dati
    console.log(parsePostData.title)
    console.log(parsePostData.content)
    console.log(parsePostData.status)

    // TODO: Elaborazione dati con AI
    // ? Fetch WordPress
    
    // * Quando si effettua una richiesta API all'AI il testo principalmente sara' di tipo Markdown
    // * Esiste una libreria chiamata marked.js
    // ! Marked non sanifica l'output HTML, quindi attacchi XSS sono possibili
    // ! E' consigliabile utilizzare DOMPurify come opzione di filtraggio

    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Issues essendo un array, si puo' iterare per vedere il messaggio
      for (const issue of error.issues) {
        console.error(issue.message);
      }
    }

    return res.json({
      success: false,
      error: "La richiesta non e' stata effettuata correttamente"
    }).sendStatus(400);
  }
}