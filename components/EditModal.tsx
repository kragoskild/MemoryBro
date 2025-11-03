import React, { useState, useEffect } from 'react';
import { EditableItem, Priority, Task, Note, Expense } from '../types';

interface EditModalProps {
    item: EditableItem;
    onClose: () => void;
    onUpdate: (item: EditableItem) => void;
}

// Helper function to format ISO date string to a value compatible with datetime-local input
const formatDateForInput = (isoString?: string): string => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        // Adjust for timezone offset to display the correct local time in the input
        const timezoneOffset = date.getTimezoneOffset() * 60000; // in milliseconds
        const localDate = new Date(date.getTime() - timezoneOffset);
        return localDate.toISOString().slice(0, 16);
    } catch (e) {
        return '';
    }
};


const EditModal: React.FC<EditModalProps> = ({ item, onClose, onUpdate }) => {
    const [formData, setFormData] = useState(item);

    useEffect(() => {
        setFormData(item);
    }, [item]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // When a datetime-local input changes, convert its value back to a full ISO string
        const finalValue = type === 'datetime-local' && value ? new Date(value).toISOString() : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if ('etiquetas' in formData) {
            setFormData(prev => ({ ...prev, etiquetas: e.target.value.split(',').map(tag => tag.trim()) }));
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(formData);
    };

    const isTask = (item: EditableItem): item is Task => 'estado' in item;
    const isNote = (item: EditableItem): item is Note => 'etiquetas' in item;
    const isExpense = (item: EditableItem): item is Expense => 'monto' in item;
    
    const getTitle = () => {
        if (isTask(item)) return `Editar ${item.tipo}`;
        if (isNote(item)) return 'Editar Nota';
        if (isExpense(item)) return 'Editar Gasto';
        return 'Editar';
    }
    
    const renderFormFields = () => {
        if (isTask(formData)) {
            return (
                <>
                    <div className="mb-4">
                        <label htmlFor="contenido" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contenido</label>
                        <textarea id="contenido" name="contenido" value={formData.contenido} onChange={handleChange} rows={3} className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md p-2 focus:ring-sky-500 focus:border-sky-500"></textarea>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="fecha_vencimiento" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha de Vencimiento</label>
                        <input type="datetime-local" id="fecha_vencimiento" name="fecha_vencimiento" value={formatDateForInput(formData.fecha_vencimiento)} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md p-2 focus:ring-sky-500 focus:border-sky-500" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="prioridad" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prioridad</label>
                        <select id="prioridad" name="prioridad" value={formData.prioridad} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md p-2 focus:ring-sky-500 focus:border-sky-500">
                            <option value={Priority.ALTA}>Alta</option>
                            <option value={Priority.MEDIA}>Media</option>
                            <option value={Priority.BAJA}>Baja</option>
                        </select>
                    </div>
                     <div className="mb-4">
                        <label htmlFor="estado" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
                        <select id="estado" name="estado" value={formData.estado} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md p-2 focus:ring-sky-500 focus:border-sky-500">
                            <option value="pendiente">Pendiente</option>
                            <option value="hecho">Hecho</option>
                        </select>
                    </div>
                </>
            );
        }
        if (isNote(formData)) {
            return (
                <>
                    <div className="mb-4">
                        <label htmlFor="contenido" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contenido</label>
                        <textarea id="contenido" name="contenido" value={formData.contenido} onChange={handleChange} rows={5} className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md p-2 focus:ring-sky-500 focus:border-sky-500"></textarea>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="categoria" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoría</label>
                        <input type="text" id="categoria" name="categoria" value={formData.categoria} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md p-2 focus:ring-sky-500 focus:border-sky-500" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="etiquetas" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Etiquetas (separadas por comas)</label>
                        <input type="text" id="etiquetas" name="etiquetas" value={formData.etiquetas.join(', ')} onChange={handleTagChange} className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md p-2 focus:ring-sky-500 focus:border-sky-500" />
                    </div>
                </>
            );
        }
        if (isExpense(formData)) {
             return (
                <>
                    <div className="mb-4">
                        <label htmlFor="descripcion" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
                        <input type="text" id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md p-2 focus:ring-sky-500 focus:border-sky-500" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="monto" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Monto (€)</label>
                        <input type="number" id="monto" name="monto" value={formData.monto} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md p-2 focus:ring-sky-500 focus:border-sky-500" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="categoria" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoría</label>
                        <input type="text" id="categoria" name="categoria" value={formData.categoria} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md p-2 focus:ring-sky-500 focus:border-sky-500" />
                    </div>
                     <div className="mb-4">
                        <label htmlFor="fecha" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha</label>
                        <input type="datetime-local" id="fecha" name="fecha" value={formatDateForInput(formData.fecha)} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md p-2 focus:ring-sky-500 focus:border-sky-500" />
                    </div>
                </>
            );
        }
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{getTitle()}</h2>
                    </div>
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {renderFormFields()}
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors">
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditModal;