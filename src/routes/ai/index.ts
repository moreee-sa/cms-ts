import { PostSchema, type PostType } from '@/types';
import type { Request, Response } from 'express';
import { handleError } from '@/routes/errors';
import { getAISuggestion } from '@/services';

export const generatePreview = async (req: Request, res: Response) => {
  const postData: PostType = req.body;
  if (!postData) {
    return res.status(400).json({
      success: false,
      error: "La richiesta non e' stata effettuata correttamente"
    });
  };

  try {
    const parsePostData = PostSchema.parse({
      title: postData.title,
      content: postData.content,
      status: postData.status,
    });

    const generatedText = await getAISuggestion(parsePostData.title, parsePostData.content);

    return res.status(200).json({
      success: true,
      content: generatedText
    });
  } catch (error) {
    handleError(error, res);
  }
}