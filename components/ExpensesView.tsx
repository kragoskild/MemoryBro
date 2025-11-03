import React from 'react';
import { Expense, EditableItem } from '../types';

interface ExpensesViewProps {
    expenses: Expense[];
    deleteExpense: (expenseId: string) => void;
    onEdit: (item: EditableItem) => void;
}

const ExpensesView: React.FC<ExpensesViewProps> = ({ expenses, deleteExpense, onEdit }) => {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.monto, 0);

    const expensesByDate = expenses
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .reduce((acc, expense) => {
            const date = new Date(expense.fecha).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(expense);
            return acc;
        }, {} as Record<string, Expense[]>);

    const sortedDates = Object.keys(expensesByDate);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gastos</h1>
                <div className="text-right">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Total Gastado</p>
                    <p className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">€{totalExpenses.toFixed(2)}</p>
                </div>
            </div>
             {expenses.length > 0 ? (
                <div className="space-y-6">
                    {sortedDates.map(date => (
                        <div key={date}>
                            <h2 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">
                                {new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </h2>
                             <ul className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-md border border-slate-200 dark:border-slate-700">
                                {expensesByDate[date].map((expense, index) => (
                                    <li key={expense.id} className={`flex items-center justify-between p-3 ${index < expensesByDate[date].length -1 ? 'border-b border-slate-200 dark:border-slate-700' : ''}`}>
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-slate-200">{expense.descripcion}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{expense.categoria}</p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">€{expense.monto.toFixed(2)}</span>
                                            <button onClick={() => onEdit(expense)} className="text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                            </button>
                                            <button onClick={() => deleteExpense(expense.id)} className="text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400">No hay gastos registrados.</p>
                </div>
            )}
        </div>
    );
};

export default ExpensesView;
