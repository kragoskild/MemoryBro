import React from 'react';
import { Theme } from '../types';

interface SettingsViewProps {
    currentTheme: Theme;
    setTheme: (theme: Theme) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ currentTheme, setTheme }) => {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Configuración</h1>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-semibold mb-4">Apariencia</h2>
                <div className="flex items-center justify-between">
                    <p className="text-slate-600 dark:text-slate-300">Tema de la aplicación</p>
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
        </div>
    );
};

export default SettingsView;
