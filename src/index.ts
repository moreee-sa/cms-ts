import express, { type Request, type Response } from 'express'
const app = express();
const port: number = 3000;

app.use(express.json());

app.get('/', (res: Response) => {
  return res.json({
    name: "cms-ts endpoint",
    success: true
  });
});

app.listen(port, () => {
  console.log(`Applicazione in ascolto sulla porta ${port}`);
});