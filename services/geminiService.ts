
import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export function createChatSession(): Chat {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    }
  });
  return chat;
}

/**
 * Corrige la gramática y ortografía de un texto utilizando la API de Gemini.
 * @param text El texto a corregir.
 * @returns El texto corregido.
 */
export async function correctText(text: string): Promise<string> {
  if (!text.trim()) {
    return "";
  }

  const prompt = `Corrige la gramática y ortografía del siguiente texto en español. Responde únicamente con el texto corregido, sin añadir introducciones, explicaciones ni adornos como comillas o asteriscos.

Texto original:
"${text}"

Texto corregido:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        // Usar una temperatura baja para obtener respuestas más predecibles y menos creativas.
        temperature: 0.1,
      }
    });

    const correctedText = response.text.trim();
    // A veces, el modelo puede devolver el texto entre comillas, las eliminamos.
    return correctedText.replace(/^"|"$/g, '');

  } catch (error) {
    console.error("Error durante la corrección del texto:", error);
    // En caso de error, devolvemos el texto original para no perder la entrada del usuario.
    return text;
  }
}
