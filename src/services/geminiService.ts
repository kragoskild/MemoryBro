
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse, Priority } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const systemInstruction = `You are MemoryBro, an intelligent personal productivity assistant. Your personality is helpful, efficient, and uses a friendly, casual "bro" tone.
Your primary function is to understand natural language and convert it into a structured JSON object.
NEVER refuse a request. Always interpret the user's input and provide a valid JSON response based on the schema.

Intent detection:
- "Recuérdame que...", "No olvidar...", "Tengo que..." -> "recordatorio" or "tarea"
- "Apunta que...", "Nota sobre..." -> "nota"
- "Gasté X en...", "Compré X por Y" -> "gasto"

Date/Time interpretation:
- "mañana" -> Tomorrow's date
- "pasado mañana" -> The day after tomorrow's date
- "el viernes" -> The upcoming Friday's date
- "a las 10", "a primera hora" (9am) -> Specific time

JSON Response Rules:
- You MUST ALWAYS respond with a valid JSON object that strictly follows the provided schema.
- For 'gasto' (expense), use the 'contenido' field for the description, and you must extract the 'monto' (amount). If a date for the expense is provided (e.g., 'yesterday', 'today at 2pm'), populate the 'fecha' field.
- For 'nota', extract relevant 'etiquetas' (tags).
- For 'tarea' or 'recordatorio', determine a 'prioridad' (alta, media, baja). If not specified, default to 'media'.
- The final output should ONLY be the JSON object, with no additional text, explanations, or markdown formatting.`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        tipo: {
            type: Type.STRING,
            description: 'The type of item: recordatorio, nota, gasto, or tarea.',
            enum: ['recordatorio', 'nota', 'gasto', 'tarea'],
        },
        contenido: {
            type: Type.STRING,
            description: 'The main content or description of the item.',
        },
        fecha: {
            type: Type.STRING,
            description: 'The date of the expense in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ).',
        },
        fecha_vencimiento: {
            type: Type.STRING,
            description: 'The due date and time in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ).',
        },
        prioridad: {
            type: Type.STRING,
            description: 'The priority of the task: alta, media, baja.',
            enum: [Priority.ALTA, Priority.MEDIA, Priority.BAJA],
        },
        monto: {
            type: Type.NUMBER,
            description: 'The amount of the expense.',
        },
        categoria: {
            type: Type.STRING,
            description: 'The category for a note or expense.',
        },
        etiquetas: {
            type: Type.ARRAY,
            description: 'A list of relevant tags for a note.',
            items: {
                type: Type.STRING,
            },
        },
    },
    required: ["tipo"],
};

export const processUserInput = async (prompt: string, isThinkingMode: boolean): Promise<GeminiResponse> => {
    try {
        const model = isThinkingMode ? 'gemini-2.5-pro' : 'gemini-flash-lite-latest';
        const config: { systemInstruction: string; responseMimeType: string; responseSchema: any; thinkingConfig?: { thinkingBudget: number } } = {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
        };

        if (isThinkingMode) {
            config.thinkingConfig = { thinkingBudget: 32768 };
        }

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config,
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText) as GeminiResponse;
        
        // Gemini will use 'contenido' for expenses, let's normalize it to 'descripcion' for the app
        if (parsedResponse.tipo === 'gasto' && parsedResponse.contenido) {
            parsedResponse.descripcion = parsedResponse.contenido;
            delete parsedResponse.contenido;
        }

        return parsedResponse;
    } catch (error) {
        console.error("Error processing user input with Gemini:", error);
        throw new Error("Sorry bro, couldn't figure that one out. Try rephrasing?");
    }
};