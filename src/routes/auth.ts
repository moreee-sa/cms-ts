import { UserSchema, type UserType } from '@/types';
import type { Request, Response } from 'express';
import { handleError } from '@/routes/errors';

export const createUser = async (req: Request, res: Response) => {
  const userData: UserType = req.body;

  if (!userData) {
    return res.json({
      success: false,
      error: "La richiesta non e' stata effettuata correttamente"
    }).sendStatus(400);
  };

  try {
    const parseUserData = UserSchema.parse({
      name: userData.name,
      email: userData.email,
      password: userData.password
    });

    console.log(parseUserData.name)
    console.log(parseUserData.email)
    console.log(parseUserData.password)

  } catch (error) {
    return handleError(error, res);
  }

  return res.sendStatus(200);
}