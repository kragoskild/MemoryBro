import React, { useState } from 'react';
// FIX: Import EditableItem to support editing functionality.
import { Task, Note, Expense, View, Priority, GeminiResponse, EditableItem } from './types';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import TasksView from '../components/TasksView';
import NotesView from '../components/NotesView';
import ExpensesView from '../components/ExpensesView';
// FIX: Import CalendarView and EditModal components.
import CalendarView from '../components/CalendarView';
import EditModal from '../components/EditModal';
// FIX: Import generateQueryResponse to handle queries.
import { generateQueryResponse } from './services/geminiService';


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

    // FIX: Added state and handlers for the edit modal.
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<EditableItem | null>(null);

    const handleEditItem = (item: EditableItem) => {
        setEditingItem(item);
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setEditingItem(null);
    };

    const handleUpdateItem = (updatedItem: EditableItem) => {
        if ('estado' in updatedItem) { // It's a Task
            setTasks(tasks.map(t => t.id === updatedItem.id ? updatedItem as Task : t));
        } else if ('etiquetas' in updatedItem) { // It's a Note
            setNotes(notes.map(n => n.id === updatedItem.id ? updatedItem as Note : n));
        } else { // It's an Expense
            setExpenses(expenses.map(e => e.id === updatedItem.id ? updatedItem as Expense : e));
        }
        handleCloseModal();
    };

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

    // FIX: Added query handler to process natural language queries.
    const handleQuery = async (query: string): Promise<string> => {
        let summaryData = '';
        if (query.toLowerCase().includes('task')) {
            const pendingTasks = tasks.filter(t => t.estado === 'pendiente').length;
            const doneTasks = tasks.filter(t => t.estado === 'hecho').length;
            summaryData = `You have ${pendingTasks} pending tasks and ${doneTasks} completed. In total, ${tasks.length} tasks.`;
        } else if (query.toLowerCase().includes('expense')) {
            const total = expenses.reduce((sum, exp) => sum + exp.monto, 0);
            summaryData = `You have logged ${expenses.length} expenses, totaling $${total.toFixed(2)}.`;
        } else if (query.toLowerCase().includes('note')) {
            summaryData = `You currently have ${notes.length} notes saved.`;
        } else {
            summaryData = "I didn't quite get that. Can you be more specific about tasks, expenses, or notes?";
        }
        return await generateQueryResponse(summaryData);
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
                // FIX: Passed required onQuery prop.
                return <Dashboard tasks={tasks} notes={notes} expenses={expenses} onNewItem={handleNewItem} onQuery={handleQuery} />;
            case 'Tasks':
                // FIX: Passed required onEdit prop.
                return <TasksView tasks={tasks} toggleTaskStatus={toggleTaskStatus} deleteTask={deleteTask} onEdit={handleEditItem} />;
            case 'Notes':
                // FIX: Passed required onEdit prop.
                return <NotesView notes={notes} deleteNote={deleteNote} onEdit={handleEditItem} />;
            case 'Expenses':
                // FIX: Passed required onEdit prop.
                return <ExpensesView expenses={expenses} deleteExpense={deleteExpense} onEdit={handleEditItem} />;
            // FIX: Added Calendar view to handle navigation.
            case 'Calendar':
                return <CalendarView tasks={tasks} onEditTask={handleEditItem} />;
            default:
                // FIX: Passed required onQuery prop.
                return <Dashboard tasks={tasks} notes={notes} expenses={expenses} onNewItem={handleNewItem} onQuery={handleQuery} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
            {/* FIX: setActiveView prop type is now correct after updating View type. */}
            <Header activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-grow p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
                {renderContent()}
            </main>
            {/* FIX: Render the EditModal when active. */}
            {isEditModalOpen && editingItem && (
                <EditModal item={editingItem} onClose={handleCloseModal} onUpdate={handleUpdateItem} />
            )}
        </div>
    );
};

export default App;
