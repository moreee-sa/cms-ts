import * as z from 'zod';

export const PostSchema = z.object({
  title: z.string("Il titolo e' obbligatorio").min(1),
  content: z.string("Il contenuto e' obbligatorio").min(1),
  status: z.enum(['publish', 'future', 'draft', 'pending', 'private']),
  // categories: z.array(z.int())
});

export type PostType = z.infer<typeof PostSchema>;

export const UserSchema = z.object({
  name: z.string("Il nome e' obbligatorio").min(5, "Il nome utente e' di minimo 5 caratteri"),
  email: z.email("L'email e' obbligatoria").toLowerCase(),
  password: z.string("La password e' obbglitatoria").min(8, "La password deve essere di minimo 8 caratteri")
});

export type UserType = z.infer<typeof UserSchema>;

export type ApplicationPassword = {
  name: string;
  created: string;
  password: string;
}

export const LoginSchema = z.object({
  email: z.email("L'email non e' valida").toLowerCase(),
  password: z.string("La password e' obbligatoria").min(8, "La password deve essere di minimo 8 caratteri")
});

export type LoginType = z.infer<typeof LoginSchema>;