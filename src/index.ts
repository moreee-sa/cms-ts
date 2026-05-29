import express, { type Request, type Response } from 'express'
const app = express();
const port: number = 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  return res.send("cms-ts endpoint");
});

app.listen(port, () => {
  console.log(`Applicazione in ascolto sulla porta ${port}`);
});