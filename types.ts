export type View = 'Dashboard' | 'Tasks' | 'Notes' | 'Expenses' | 'Calendar' | 'Settings';

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

export interface Settings {
    defaultPriority: Priority;
    defaultView: View;
}

export type EditableItem = Task | Note | Expense;

export type Theme = 'light' | 'dark';

export interface Message {
    sender: 'user' | 'bot';
    text: string;
    data?: GeminiResponse;
}

export interface GeminiResponse {
    tipo: 'recordatorio' | 'nota' | 'gasto' | 'tarea' | 'consulta';
    contenido?: string;
    descripcion?: string;
    fecha_vencimiento?: string;
    fecha?: string;
    prioridad?: Priority;
    monto?: number;
    categoria?: string;
    etiquetas?: string[];
}
