import type { JWTPayload } from 'jose';

// Serve a modificare un tipo che esiste gia' globalmente
declare global {
  namespace Express {
    // Ad Express aggiunge a Request user di JWTPayload
    interface Request {
      user?: JWTPayload; // user potrebbe non esistere
    }
  }
}

export {};