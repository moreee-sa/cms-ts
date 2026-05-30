import { jwtVerify } from 'jose';
import type { Request, Response, NextFunction } from 'express';
import { config } from '@/lib';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Non autenticato" });
  }

  try {
    const secret = new TextEncoder().encode(config.jwt.secret);
    const { payload } = await jwtVerify(token, secret);
    
    req.user = payload; // passa i dati al controller
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Token non valido" });
  }
}