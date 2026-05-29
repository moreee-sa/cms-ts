import express, { Router, type Request, type Response } from 'express'
import { PostSchema, type PostType } from '@/types';
import z from 'zod';
const app = express();
const port: number = 3000;
const baseURL: string = '/cms/v1'
const WP_BASE_URL = "http://cms.test/wp-json/wp/v2";

app.use(express.json());

// TODO: Serve un middleware che automaticamente rifiuti le richieste quando il contenuto JSON ha il formato errato

const cmsRouter = Router();

// Route per verificare la salute dell'API
cmsRouter.get('/', async (req: Request, res: Response) => {
  return res.json({
    name: 'cms-ts endpoint',
    success: true
  });
});

// Route per ottenere i post dentro wordpress
cmsRouter.get('/posts', async (req: Request, res: Response) => {
  try {
    // Effettua un fetch verso WordPress per recuperare tutti i post
    const response = await fetch(`${WP_BASE_URL}/posts`);
  
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
});

// Route per inserire in wordpress l'articolo
cmsRouter.post('/posts', async (req: Request, res: Response) => {
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
    // ! E' consigliabile utilizzare DOMPurify come opzionedi filtraggio

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
});

app.use(baseURL, cmsRouter);

app.listen(port, () => {
  console.log(`Applicazione in ascolto sulla porta ${port} e endpoint ${baseURL}`);
});