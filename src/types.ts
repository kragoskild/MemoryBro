

// FIX: Added 'Calendar' to View to support the calendar view and fix navigation errors.
export type View = 'Dashboard' | 'Tasks' | 'Notes' | 'Expenses' | 'Calendar';

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

// FIX: Added EditableItem to support editing tasks, notes, and expenses.
export type EditableItem = Task | Note | Expense;

export interface Message {
    sender: 'user' | 'bot';
    text: string;
    data?: GeminiResponse;
}

export interface GeminiResponse {
    // FIX: Added 'consulta' type to support query functionality.
    tipo: 'recordatorio' | 'nota' | 'gasto' | 'tarea' | 'consulta';
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
