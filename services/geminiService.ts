import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse, Priority } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const systemInstruction = `Eres MemoryBro, un asistente de productividad personal inteligente. Tu personalidad es servicial, eficiente y usas un tono amigable y casual de "colega" o "bro".
Tu función principal es entender el lenguaje natural en español y convertirlo en un objeto JSON estructurado.
NUNCA rechaces una petición. Siempre interpreta la entrada del usuario y proporciona una respuesta JSON válida basada en el esquema.
DEBES responder siempre en español.

Detección de intenciones:
// FIX: Added 'tarea' to creation intent examples to align with the schema.
- Creación: "Recuérdame que...", "Apunta que...", "Gasté X en..." -> tipo "recordatorio", "nota", "gasto", "tarea".
- Consulta: " resume...", "dime cuántas...", "qué gastos...", "muéstrame..." -> tipo "consulta".

Reglas de la respuesta JSON:
- DEBES responder SIEMPRE con un objeto JSON válido que siga estrictamente el esquema proporcionado.
- Para 'gasto', usa el campo 'contenido' para la descripción.
- Para 'tarea' o 'recordatorio', determina una 'prioridad'.
- Para 'consulta', rellena el campo 'contenido' con una descripción breve de la consulta del usuario (ej: "resumen de tareas pendientes").
- La salida final debe ser ÚNICAMENTE el objeto JSON, sin texto adicional, explicaciones o formato markdown.`;


const responseSchema = {
    type: Type.OBJECT,
    properties: {
        tipo: {
            type: Type.STRING,
            description: 'El tipo de ítem: recordatorio, nota, gasto, tarea, o consulta.',
            enum: ['recordatorio', 'nota', 'gasto', 'tarea', 'consulta'],
        },
        contenido: {
            type: Type.STRING,
            description: 'Contenido principal, descripción del gasto, o detalle de la consulta.',
        },
        fecha_vencimiento: {
            type: Type.STRING,
            description: 'Fecha de vencimiento en formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ).',
        },
        fecha: {
            type: Type.STRING,
            description: 'Fecha de un gasto en formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ).',
        },
        prioridad: {
            type: Type.STRING,
            description: 'La prioridad de la tarea: alta, media, baja.',
            enum: [Priority.ALTA, Priority.MEDIA, Priority.BAJA],
        },
        monto: {
            type: Type.NUMBER,
            description: 'La cantidad del gasto.',
        },
        categoria: {
            type: Type.STRING,
            description: 'La categoría para una nota o gasto.',
        },
        etiquetas: {
            type: Type.ARRAY,
            description: 'Una lista de etiquetas relevantes para una nota.',
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
        
        if (parsedResponse.tipo === 'gasto' && parsedResponse.contenido) {
            parsedResponse.descripcion = parsedResponse.contenido;
            delete parsedResponse.contenido;
        }

        return parsedResponse;
    } catch (error) {
        console.error("Error processing user input with Gemini:", error);
        throw new Error("Lo siento, colega. No he podido procesar eso. ¿Puedes intentarlo de otra forma?");
    }
};

export const generateQueryResponse = async (summaryData: string): Promise<string> => {
    try {
        const model = 'gemini-flash-lite-latest';
        const prompt = `Actúa como MemoryBro, un asistente amigable. Basado en los siguientes datos, da una respuesta concisa y en tono de "colega": "${summaryData}"`;
        
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating query response:", error);
        return "Uups, algo salió mal al generar la respuesta. Pero aquí tienes los datos en bruto: " + summaryData;
    }
};