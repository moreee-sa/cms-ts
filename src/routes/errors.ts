import type { Response } from 'express';
import z from 'zod';

export const handleError = (error: unknown, res: Response) => {
  let message: string[] = []

  if (error instanceof z.ZodError) {
    for (const issue of error.issues) {
      console.error(issue.message);
      message.push(issue.message)
    }

    return res.status(400).json({
      success: false,
      error: "La richiesta non e' stata effettuata correttamente",
      message: message
    })
  }

  if (error instanceof Error) {
    return res.status(409).json({
      success: false,
      message: error.message
    });
  }

  return res.status(500).json({
    success: false,
    error: "Errore interno del server"
  });
}

export const handleMissingAuthentication = (authHeader: string | undefined, res: Response) => {
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: "Autenticazione mancante"
    })
  };
}