import express, { Router, type Request, type Response } from 'express'
import { getPosts, insertPost } from '@/routes/wordpress';
import { getAPIHealth } from '@/routes/';
import { config } from '@/lib'
import { createUser } from '@/routes/auth';

const app = express();

app.use(express.json());

// TODO: Serve un middleware che automaticamente rifiuti le richieste quando il contenuto JSON ha il formato errato

const cmsRouter = Router();

// Questi endpoint si occupano di gestire il fetch dei dati su wordpress
cmsRouter.get('/', getAPIHealth); // Route per verificare la salute dell'API
cmsRouter.get('/posts', getPosts); // Route per ottenere i post dentro wordpress
cmsRouter.post('/posts', insertPost); // Route per inserire in wordpress l'articolo

// Endpoint per la gestione degli utenti
cmsRouter.post('/auth/register', createUser);
// TODO: /cms/v1/auth/login

app.use(config.server.prefix, cmsRouter);

app.listen(config.server.port, () => {
  console.log(`Applicazione in ascolto sulla porta ${config.server.port} e endpoint ${config.server.prefix}`);
});