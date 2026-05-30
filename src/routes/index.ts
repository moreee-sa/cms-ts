import type { Request, Response } from 'express';

export const getAPIHealth = async (req: Request, res: Response) => {
  return res.json({
    name: 'cms-ts endpoint',
    success: true
  });
}