import React from 'react';
import { Expense } from '../../types';

const ExpensesWidget: React.FC<{ expenses: Expense[] }> = ({ expenses }) => {
    const total = expenses.reduce((sum, exp) => sum + exp.monto, 0);
    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">💰 Gastos Recientes</h3>
                <span className="font-bold text-emerald-500 dark:text-emerald-400">€{total.toFixed(2)}</span>
            </div>
            {expenses.length > 0 ? (
                 <ul className="space-y-2">
                    {expenses.map(exp => (
                        <li key={exp.id} className="text-sm flex justify-between">
                           <span className="text-slate-600 dark:text-slate-300 truncate pr-2">{exp.descripcion}</span>
                           <span className="text-slate-500 dark:text-slate-400 font-medium">€{exp.monto.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No hay gastos recientes registrados.</p>
            )}
        </div>
    );
};

export default ExpensesWidget;
