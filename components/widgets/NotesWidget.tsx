import React from 'react';
import { Note } from '../../types';

const NotesWidget: React.FC<{ notes: Note[] }> = ({ notes }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">📝 Notas Recientes</h3>
            {notes.length > 0 ? (
                 <ul className="space-y-2">
                    {notes.map(note => (
                        <li key={note.id} className="text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 p-2 rounded truncate">
                           {note.contenido}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No hay notas recientes.</p>
            )}
        </div>
    );
};

export default NotesWidget;
