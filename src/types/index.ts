import * as z from 'zod';

export const PostSchema = z.object({
  title: z.string("Il titolo e' obbligatorio").min(1),
  content: z.string("Il contenuto e' obbligatorio").min(1),
  status: z.enum(['publish', 'future', 'draft', 'pending', 'private'])
});

export type PostType = z.infer<typeof PostSchema>;