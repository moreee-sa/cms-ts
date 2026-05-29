import express, { Router, type Request, type Response } from 'express'
const app = express();
const port: number = 3000;
const baseURL: string = '/cms/v1'
const WP_BASE_URL = "http://cms.test/wp-json/wp/v2";

app.use(express.json());

const cmsV1Router = Router();

// Route per verificare la salute dell'API
cmsV1Router.get('/', (req: Request, res: Response) => {
  return res.json({
    name: 'cms-ts endpoint',
    success: true
  });
});

// Route per ottenere i post dentro wordpress
cmsV1Router.get('/posts', async (req: Request, res: Response) => {
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
    console.error("Errore di connessione a Wordpress ->", error);
    return res.sendStatus(500);
  }
});

app.use(baseURL, cmsV1Router);

app.listen(port, () => {
  console.log(`Applicazione in ascolto sulla porta ${port} e endpoint ${baseURL}`);
});