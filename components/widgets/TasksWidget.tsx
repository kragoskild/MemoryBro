import React from 'react';
import { Task } from '../../types';

const TasksWidget: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">✅ Tareas Pendientes</h3>
            {tasks.length > 0 ? (
                <ul className="space-y-2">
                    {tasks.map(task => (
                        <li key={task.id} className="text-sm text-slate-600 dark:text-slate-300 flex items-center">
                           <span className="w-4 h-4 rounded border-2 border-slate-400 dark:border-slate-500 mr-2 flex-shrink-0"></span>
                           <span className="truncate">{task.contenido}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No hay tareas pendientes. ¡Genial!</p>
            )}
        </div>
    );
};

export default TasksWidget;
