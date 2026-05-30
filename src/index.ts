import express, { Router, type Request, type Response } from 'express'
import { getPosts, insertPost } from '@/routes/wordpress';
import { getAPIHealth } from '@/routes/';
import { config } from '@/lib'

const app = express();

app.use(express.json());

// TODO: Serve un middleware che automaticamente rifiuti le richieste quando il contenuto JSON ha il formato errato

const cmsRouter = Router();

// Route per verificare la salute dell'API
cmsRouter.get('/', getAPIHealth);

// Route per ottenere i post dentro wordpress
cmsRouter.get('/posts', getPosts);

// Route per inserire in wordpress l'articolo
cmsRouter.post('/posts', insertPost);

app.use(config.server.prefix, cmsRouter);

app.listen(config.server.port, () => {
  console.log(`Applicazione in ascolto sulla porta ${config.server.port} e endpoint ${config.server.prefix}`);
});