import express, { Router} from 'express'
import cors, { type CorsOptions } from 'cors';
import { getPosts, createPost, getPostsById, deletePost } from '@/routes/posts';
import { getAPIHealth } from '@/routes/';
import { config } from '@/lib'
import { createUser, loginUser } from '@/routes/auth';
import { authMiddleware } from '@/routes/middleware';
import cookieParser from 'cookie-parser';
import { generatePreview } from '@/routes/ai';

const app = express();

const corsOptions: CorsOptions = {
  // origin: [''],
  methods: ['GET', 'POST', 'DELETE']
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// TODO: Serve un middleware che automaticamente rifiuti le richieste quando il contenuto JSON ha il formato errato

const cmsRouter = Router();

cmsRouter.get('/', getAPIHealth); // Route per verificare la salute dell'API

// Questi endpoint si occupano di gestire il fetch dei dati su wordpress
cmsRouter.get('/posts', getPosts); // Route per ottenere i post dentro wordpress (solo quelli public)
cmsRouter.post('/posts', authMiddleware, createPost); // Route per creare l'articolo in wordpress
cmsRouter.delete('/posts/:id', authMiddleware, deletePost); // Per cancellare un post
// cmsRouter.put('/posts/:id', updatePost);

// Integrazione con Gemini
cmsRouter.post('/posts/preview', authMiddleware, generatePreview) // Partendo da un contenuto, utilizza Gemini con Google Search per migliorare il contenuto

// Endpoint per la gestione degli utenti
cmsRouter.post('/auth/register', createUser); // Per creare l'utente su WordPress, creare la password applicazione e salvarli sul database
cmsRouter.post('/auth/login', loginUser) // Per effettuare il login, restituisce un cookie per l'accesso

// Dashboard
cmsRouter.get('/dashboard/posts', authMiddleware, getPostsById); // Route per ottenere tutti i post dell'autore, anche quelli privati, tramite il suo ID (Dentro JWT)

app.use(config.server.prefix, cmsRouter);

app.listen(config.server.port, () => {
  console.log(`Applicazione in ascolto sulla porta ${config.server.port} e endpoint ${config.server.prefix}`);
});