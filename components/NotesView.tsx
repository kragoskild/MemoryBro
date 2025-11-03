import React from 'react';
import { Note, EditableItem } from '../types';

interface NotesViewProps {
    notes: Note[];
    deleteNote: (noteId: string) => void;
    onEdit: (item: EditableItem) => void;
}

const NoteCard: React.FC<{ note: Note; onDelete: (id: string) => void; onEdit: (item: Note) => void; }> = ({ note, onDelete, onEdit }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 flex flex-col justify-between h-full border border-slate-200 dark:border-slate-700">
            <div>
                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap mb-4">{note.contenido}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Categoría: {note.categoria}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
                <div className="flex flex-wrap gap-2">
                    {note.etiquetas.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300 text-xs rounded-full">#{tag}</span>
                    ))}
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => onEdit(note)} className="text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                    </button>
                    <button onClick={() => onDelete(note.id)} className="text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

const NotesView: React.FC<NotesViewProps> = ({ notes, deleteNote, onEdit }) => {
    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Notas</h1>
            {notes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {notes.map(note => (
                        <NoteCard key={note.id} note={note} onDelete={deleteNote} onEdit={onEdit} />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400">No tienes ninguna nota guardada.</p>
                </div>
            )}
        </div>
    );
};

export default NotesView;
