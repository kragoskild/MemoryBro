import React, { useState } from 'react';
import { Task, Priority, EditableItem } from '../types';

interface TasksViewProps {
    tasks: Task[];
    toggleTaskStatus: (taskId: string) => void;
    deleteTask: (taskId: string) => void;
    onEdit: (item: EditableItem) => void;
}

const priorityStyles = {
    [Priority.ALTA]: 'bg-red-500/80 text-white',
    [Priority.MEDIA]: 'bg-yellow-500/80 text-yellow-900',
    [Priority.BAJA]: 'bg-green-500/80 text-white',
};

const TaskItem: React.FC<{ task: Task; onToggle: (id: string) => void; onDelete: (id: string) => void; onEdit: (item: Task) => void; }> = ({ task, onToggle, onDelete, onEdit }) => {
    const isOverdue = task.fecha_vencimiento && new Date(task.fecha_vencimiento) < new Date() && task.estado === 'pendiente';
    return (
        <li className={`flex items-center justify-between p-3 rounded-lg transition-colors ${task.estado === 'hecho' ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-500' : 'bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600'}`}>
            <div className="flex items-center flex-grow min-w-0">
                <input
                    type="checkbox"
                    checked={task.estado === 'hecho'}
                    onChange={() => onToggle(task.id)}
                    className="h-5 w-5 rounded border-slate-400 dark:border-slate-500 text-sky-500 bg-slate-100 dark:bg-slate-600 focus:ring-sky-500 cursor-pointer flex-shrink-0"
                />
                <div className="ml-4 min-w-0">
                    <p className={`font-medium truncate ${task.estado === 'hecho' ? 'line-through' : 'text-slate-800 dark:text-slate-100'}`}>{task.contenido}</p>
                    {task.fecha_vencimiento && (
                        <p className={`text-xs ${isOverdue ? 'text-red-500 dark:text-red-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                            Vence: {new Date(task.fecha_vencimiento).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityStyles[task.prioridad]} capitalize`}>{task.prioridad}</span>
                 <button onClick={() => onEdit(task)} className="text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                </button>
                <button onClick={() => onDelete(task.id)} className="text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        </li>
    );
};

const TasksView: React.FC<TasksViewProps> = ({ tasks, toggleTaskStatus, deleteTask, onEdit }) => {
    const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
    const filteredTasks = tasks.filter(task => {
        if (filter === 'pending') return task.estado === 'pendiente';
        if (filter === 'done') return task.estado === 'hecho';
        return true;
    }).sort((a, b) => {
        if (a.fecha_vencimiento && b.fecha_vencimiento) {
            return new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime();
        }
        if (a.fecha_vencimiento) return -1;
        if (b.fecha_vencimiento) return 1;
        return 0;
    });

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Tareas y Recordatorios</h1>
            <div className="mb-4 flex space-x-2 p-1 bg-slate-200 dark:bg-slate-800 rounded-lg">
                <button onClick={() => setFilter('all')} className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50'}`}>Todas</button>
                <button onClick={() => setFilter('pending')} className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50'}`}>Pendientes</button>
                <button onClick={() => setFilter('done')} className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'done' ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50'}`}>Hechas</button>
            </div>
            {filteredTasks.length > 0 ? (
                <ul className="space-y-3">
                    {filteredTasks.map(task => (
                        <TaskItem key={task.id} task={task} onToggle={toggleTaskStatus} onDelete={deleteTask} onEdit={onEdit} />
                    ))}
                </ul>
            ) : (
                <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400">No hay tareas que coincidan con el filtro.</p>
                </div>
            )}
        </div>
    );
};

export default TasksView;
