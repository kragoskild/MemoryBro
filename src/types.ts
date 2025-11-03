
export type View = 'Dashboard' | 'Tasks' | 'Notes' | 'Expenses';

export enum Priority {
    ALTA = 'alta',
    MEDIA = 'media',
    BAJA = 'baja',
}

export interface Task {
    id: string;
    tipo: 'tarea' | 'recordatorio';
    contenido: string;
    fecha_vencimiento?: string;
    prioridad: Priority;
    estado: 'pendiente' | 'hecho';
}

export interface Note {
    id: string;
    contenido: string;
    categoria: string;
    etiquetas: string[];
}

export interface Expense {
    id: string;
    monto: number;
    descripcion: string;
    categoria: string;
    fecha: string;
}

export interface Message {
    sender: 'user' | 'bot';
    text: string;
    data?: GeminiResponse;
}

export interface GeminiResponse {
    tipo: 'recordatorio' | 'nota' | 'gasto' | 'tarea';
    contenido?: string;
    descripcion?: string;
    fecha_vencimiento?: string;
    // Fix: Add optional fecha property for expenses
    fecha?: string;
    prioridad?: Priority;
    monto?: number;
    categoria?: string;
    etiquetas?: string[];
}
