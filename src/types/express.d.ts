import type { JWTPayload } from 'jose';

// Serve a modificare un tipo che esiste gia' globalmente
declare global {
  namespace Express {
    // Ad Express.Request viene aggiunto user dell'interfaccia JWTPayload
    interface Request {
      user?: JWTPayload; // user potrebbe non esistere
    }
  }
}

export {};