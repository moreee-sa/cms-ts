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
    // Questa configurazione si danno delle istruzioni precise a Gemini
      config: {
        systemInstruction: `Sei un editor giornalistico italiano. 
          Migliora SOLO il contenuto del testo che ti viene fornito, senza modificare il titolo.
          Rispondi ESCLUSIVAMENTE con il contenuto migliorato, senza commenti, spiegazioni, introduzioni o note.
          Non aggiungere titoli, intestazioni o sezioni extra.
          Non spiegare cosa hai fatto o perché.
          Solo il contenuto migliorato, nient'altro.`
      },
    contents: `Titolo: ${title}\n\nContenuto: ${content}`,
  });

  return response.text;
}