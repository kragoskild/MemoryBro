import React, { useState } from 'react';
import { Theme, Settings, Priority, View } from '../types';

interface SettingsViewProps {
    currentTheme: Theme;
    setTheme: (theme: Theme) => void;
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
    clearAllData: () => void;
}

const ConfirmationModal: React.FC<{ onConfirm: () => void; onCancel: () => void; }> = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">¿Estás seguro?</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
                Esta acción es irreversible y borrará todas tus tareas, notas y gastos.
            </p>
            <div className="flex justify-end space-x-3">
                <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                    Cancelar
                </button>
                <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
                    Sí, borrar todo
                </button>
            </div>
        </div>
    </div>
);


const SettingsView: React.FC<SettingsViewProps> = ({ currentTheme, setTheme, settings, updateSettings, clearAllData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const handleClearDataClick = () => {
        setIsModalOpen(true);
    };

    const handleConfirmClear = () => {
        clearAllData();
        setIsModalOpen(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Configuración</h1>
            
            {/* Appearance Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Apariencia</h2>
                <div className="flex items-center justify-between">
                    <label htmlFor="theme-toggle" className="text-slate-600 dark:text-slate-300">Tema de la aplicación</label>
                    <div className="flex items-center space-x-2 p-1 rounded-lg bg-slate-200 dark:bg-slate-700">
                        <button 
                            onClick={() => setTheme('light')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${currentTheme === 'light' ? 'bg-white shadow text-slate-900' : 'text-slate-600 dark:text-slate-300'}`}
                        >
                            Claro
                        </button>
                        <button 
                            onClick={() => setTheme('dark')}
                             className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${currentTheme === 'dark' ? 'bg-slate-900 shadow text-white' : 'text-slate-600 dark:text-slate-300'}`}
                        >
                            Oscuro
                        </button>
                    </div>
                </div>
            </div>

            {/* General Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Preferencias</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label htmlFor="default-priority" className="text-slate-600 dark:text-slate-300">Prioridad por defecto para tareas nuevas</label>
                        <select
                            id="default-priority"
                            value={settings.defaultPriority}
                            onChange={(e) => updateSettings({ defaultPriority: e.target.value as Priority })}
                            className="w-40 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md p-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800 dark:text-slate-200"
                        >
                            <option value={Priority.ALTA}>Alta</option>
                            <option value={Priority.MEDIA}>Media</option>
                            <option value={Priority.BAJA}>Baja</option>
                        </select>
                    </div>
                     <div className="flex items-center justify-between">
                        <label htmlFor="default-view" className="text-slate-600 dark:text-slate-300">Vista de inicio</label>
                        <select
                            id="default-view"
                            value={settings.defaultView}
                            onChange={(e) => updateSettings({ defaultView: e.target.value as View })}
                            className="w-40 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md p-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800 dark:text-slate-200"
                        >
                            <option value="Dashboard">Dashboard</option>
                            <option value="Tasks">Tareas</option>
                            <option value="Calendar">Calendario</option>
                            <option value="Notes">Notas</option>
                            <option value="Expenses">Gastos</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Management */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Gestión de Datos</h2>
                <div className="flex items-center justify-between">
                     <p className="text-slate-600 dark:text-slate-300">Borrar todos los datos de la aplicación.</p>
                     <button
                        onClick={handleClearDataClick}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                     >
                        Borrar Todo
                     </button>
                </div>
            </div>

            {isModalOpen && <ConfirmationModal onConfirm={handleConfirmClear} onCancel={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default SettingsView;
