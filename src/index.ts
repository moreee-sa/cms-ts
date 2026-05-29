import express, { Router, type Request, type Response } from 'express'
const app = express();
const port: number = 3000;
const baseURL: string = '/cms/v1'
const WP_BASE_URL = "http://cms.test/wp-json/wp/v2";

app.use(express.json());

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
    console.error("Errore di connessione a Wordpress ->", error);
    return res.sendStatus(500);
  }
});

type PostType = {
  title: string;
  content: string;
  status: string;
}

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
  const postBodyData: PostType = req.body;
  if (!postBodyData) {
    return res.json({
      success: false,
      error: "La richiesta non e' stata effettuata correttamente"
    }).sendStatus(400);
  }

  console.log(postBodyData.content)
  console.log(postBodyData.title)
  console.log(postBodyData.status)

  return res.sendStatus(200);
});

app.use(baseURL, cmsRouter);

app.listen(port, () => {
  console.log(`Applicazione in ascolto sulla porta ${port} e endpoint ${baseURL}`);
});