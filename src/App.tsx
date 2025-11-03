import React, { useState } from 'react';
import { Task, Note, Expense, View, Priority } from './types';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import TasksView from '../components/TasksView';
import NotesView from '../components/NotesView';
import ExpensesView from '../components/ExpensesView';
import { GeminiResponse } from './types';

const App: React.FC = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [tasks, setTasks] = useState<Task[]>([
        { id: 'task_001', tipo: 'recordatorio', contenido: 'Call doctor for appointment', fecha_vencimiento: yesterday.toISOString(), prioridad: Priority.ALTA, estado: 'pendiente' },
        { id: 'task_002', tipo: 'tarea', contenido: 'Finish project report', fecha_vencimiento: today.toISOString(), prioridad: Priority.MEDIA, estado: 'pendiente' },
        { id: 'task_003', tipo: 'tarea', contenido: 'Submit expense report', fecha_vencimiento: today.toISOString(), prioridad: Priority.BAJA, estado: 'hecho' },
        { id: 'task_004', tipo: 'recordatorio', contenido: 'Buy groceries', fecha_vencimiento: tomorrow.toISOString(), prioridad: Priority.MEDIA, estado: 'pendiente' },
        { id: 'task_005', tipo: 'tarea', contenido: 'Prepare presentation for Friday', fecha_vencimiento: nextWeek.toISOString(), prioridad: Priority.ALTA, estado: 'pendiente' },
        { id: 'task_006', tipo: 'recordatorio', contenido: 'Pay electricity bill', fecha_vencimiento: tomorrow.toISOString(), prioridad: Priority.ALTA, estado: 'hecho' },
        { id: 'task_007', tipo: 'tarea', contenido: 'Water the plants', prioridad: Priority.BAJA, estado: 'pendiente' },
    ]);
    const [notes, setNotes] = useState<Note[]>([
        { id: 'note_001', contenido: 'Plumber number: 654 321 987', categoria: 'contactos', etiquetas: ['home', 'urgent'] },
    ]);
    const [expenses, setExpenses] = useState<Expense[]>([
        { id: 'exp_001', monto: 45.00, descripcion: 'Gas', categoria: 'Transporte', fecha: '2024-07-28T08:15:00Z' },
    ]);
    const [activeView, setActiveView] = useState<View>('Dashboard');

    const handleNewItem = (item: GeminiResponse) => {
        const id = `${item.tipo}_${Date.now()}`;
        switch (item.tipo) {
            case 'tarea':
            case 'recordatorio':
                if (item.contenido) {
                    const newTask: Task = {
                        id,
                        tipo: item.tipo,
                        contenido: item.contenido,
                        fecha_vencimiento: item.fecha_vencimiento,
                        prioridad: item.prioridad || Priority.MEDIA,
                        estado: 'pendiente',
                    };
                    setTasks(prev => [...prev, newTask]);
                }
                break;
            case 'nota':
                if (item.contenido) {
                    const newNote: Note = {
                        id,
                        contenido: item.contenido,
                        categoria: item.categoria || 'General',
                        etiquetas: item.etiquetas || [],
                    };
                    setNotes(prev => [...prev, newNote]);
                }
                break;
            case 'gasto':
                const descripcion = item.descripcion || item.contenido;
                if (descripcion) {
                    const newExpense: Expense = {
                        id,
                        monto: item.monto || 0,
                        descripcion: descripcion,
                        categoria: item.categoria || 'General',
                        fecha: item.fecha || new Date().toISOString(),
                    };
                    setExpenses(prev => [...prev, newExpense]);
                }
                break;
        }
    };

    const toggleTaskStatus = (taskId: string) => {
        setTasks(tasks.map(task => 
            task.id === taskId 
                ? { ...task, estado: task.estado === 'pendiente' ? 'hecho' : 'pendiente' }
                : task
        ));
    };

    const deleteTask = (taskId: string) => {
        setTasks(tasks.filter(task => task.id !== taskId));
    };

    const deleteNote = (noteId: string) => {
        setNotes(notes.filter(note => note.id !== noteId));
    };

    const deleteExpense = (expenseId: string) => {
        setExpenses(expenses.filter(expense => expense.id !== expenseId));
    };

    const renderContent = () => {
        switch (activeView) {
            case 'Dashboard':
                return <Dashboard tasks={tasks} notes={notes} expenses={expenses} onNewItem={handleNewItem} />;
            case 'Tasks':
                return <TasksView tasks={tasks} toggleTaskStatus={toggleTaskStatus} deleteTask={deleteTask} />;
            case 'Notes':
                return <NotesView notes={notes} deleteNote={deleteNote} />;
            case 'Expenses':
                return <ExpensesView expenses={expenses} deleteExpense={deleteExpense} />;
            default:
                return <Dashboard tasks={tasks} notes={notes} expenses={expenses} onNewItem={handleNewItem} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
            <Header activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-grow p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;