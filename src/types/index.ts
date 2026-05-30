import * as z from 'zod';

export const PostSchema = z.object({
  title: z.string("Il titolo e' obbligatorio").min(1),
  content: z.string("Il contenuto e' obbligatorio").min(1),
  status: z.enum(['publish', 'future', 'draft', 'pending', 'private'])
});

export type PostType = z.infer<typeof PostSchema>;

export const UserSchema = z.object({
  name: z.string("Il nome e' obbligatorio").min(5),
  email: z.email("L'email e' obbligatoria").toLowerCase(),
  password: z.string("La password e' obbglitatoria").min(8),
  wp_app_password: z.string("API Password necessaria").min(24)
});

export type UserType = z.infer<typeof UserSchema>;