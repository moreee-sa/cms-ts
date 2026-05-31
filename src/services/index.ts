import { config } from '@/lib';
import { GoogleGenAI } from '@google/genai'; // Docs https://github.com/googleapis/js-genai

export const getAISuggestion  = async (title: string, content: string) => {
  // * Quando si effettua una richiesta API all'AI il testo principalmente sara' di tipo Markdown
  // * Esiste una libreria chiamata marked.js
  // ! Marked non sanifica l'output HTML, quindi attacchi XSS sono possibili
  // ! E' consigliabile utilizzare DOMPurify come opzione di filtraggio

  const ai = new GoogleGenAI({
    apiKey: config.gemini.apiKey
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Titolo: ${title}\n\nContenuto: ${content}`,
  });

  return response.text;
}