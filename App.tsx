import React, { useState, useEffect } from 'react';
import { Task, Note, Expense, View, Priority, GeminiResponse, EditableItem, Theme, Settings } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TasksView from './components/TasksView';
import NotesView from './components/NotesView';
import ExpensesView from './components/ExpensesView';
import CalendarView from './components/CalendarView';
import SettingsView from './components/SettingsView';
import EditModal from './components/EditModal';
import { processUserInput, generateQueryResponse } from './services/geminiService';

const initialTasks: Task[] = (() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return [
        { id: 'task_001', tipo: 'recordatorio', contenido: 'Llamar al médico para pedir cita', fecha_vencimiento: yesterday.toISOString(), prioridad: Priority.ALTA, estado: 'pendiente' },
        { id: 'task_002', tipo: 'tarea', contenido: 'Terminar el informe del proyecto', fecha_vencimiento: today.toISOString(), prioridad: Priority.MEDIA, estado: 'pendiente' },
        { id: 'task_003', tipo: 'tarea', contenido: 'Enviar informe de gastos', fecha_vencimiento: today.toISOString(), prioridad: Priority.BAJA, estado: 'hecho' },
        { id: 'task_004', tipo: 'recordatorio', contenido: 'Comprar víveres', fecha_vencimiento: tomorrow.toISOString(), prioridad: Priority.MEDIA, estado: 'pendiente' },
        { id: 'task_005', tipo: 'tarea', contenido: 'Preparar la presentación para el viernes', fecha_vencimiento: nextWeek.toISOString(), prioridad: Priority.ALTA, estado: 'pendiente' },
        { id: 'task_006', tipo: 'recordatorio', contenido: 'Pagar la factura de la luz', fecha_vencimiento: tomorrow.toISOString(), prioridad: Priority.ALTA, estado: 'hecho' },
        { id: 'task_007', tipo: 'tarea', contenido: 'Regar las plantas', prioridad: Priority.BAJA, estado: 'pendiente' },
    ];
})();

const initialNotes: Note[] = [
    { id: 'note_001', contenido: 'Número del fontanero: 654 321 987', categoria: 'contactos', etiquetas: ['casa', 'urgente'] },
    { id: 'note_002', contenido: 'Idea para el proyecto X: Usar una paleta de colores más vibrante y simplificar la navegación.', categoria: 'Proyecto X', etiquetas: ['diseño', 'ux'] },
];
const initialExpenses: Expense[] = [
    { id: 'exp_001', monto: 45.00, descripcion: 'Gasolina', categoria: 'Transporte', fecha: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() },
    { id: 'exp_002', monto: 12.50, descripcion: 'Café y almuerzo', categoria: 'Comida', fecha: new Date().toISOString() },
];

const defaultSettings: Settings = {
    defaultPriority: Priority.MEDIA,
    defaultView: 'Dashboard',
};


const App: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>(() => {
        const savedTasks = localStorage.getItem('memorybro-tasks');
        if (savedTasks) return JSON.parse(savedTasks);
        return initialTasks;
    });
    const [notes, setNotes] = useState<Note[]>(() => {
        const savedNotes = localStorage.getItem('memorybro-notes');
        if (savedNotes) return JSON.parse(savedNotes);
        return initialNotes;
    });
    const [expenses, setExpenses] = useState<Expense[]>(() => {
        const savedExpenses = localStorage.getItem('memorybro-expenses');
        if (savedExpenses) return JSON.parse(savedExpenses);
        return initialExpenses;
    });
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('memorybro-theme') as Theme) || 'dark');
    const [settings, setSettings] = useState<Settings>(() => {
        const savedSettings = localStorage.getItem('memorybro-settings');
        if (savedSettings) return JSON.parse(savedSettings);
        return defaultSettings;
    });
    const [activeView, setActiveView] = useState<View>(settings.defaultView);
    
    // State for Edit Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<EditableItem | null>(null);

    useEffect(() => {
        localStorage.setItem('memorybro-tasks', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem('memorybro-notes', JSON.stringify(notes));
    }, [notes]);
    
    useEffect(() => {
        localStorage.setItem('memorybro-expenses', JSON.stringify(expenses));
    }, [expenses]);

     useEffect(() => {
        localStorage.setItem('memorybro-settings', JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('memorybro-theme', theme);
    }, [theme]);

    const handleUpdateSettings = (newSettings: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const handleClearAllData = () => {
        setTasks([]);
        setNotes([]);
        setExpenses([]);
        // Optionally reset settings too, or keep them
        // setSettings(defaultSettings); 
        localStorage.removeItem('memorybro-tasks');
        localStorage.removeItem('memorybro-notes');
        localStorage.removeItem('memorybro-expenses');
    };

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

    const handleQuery = async (query: string): Promise<string> => {
        // Basic query processing, can be expanded
        let summaryData = '';
        if (query.toLowerCase().includes('tarea')) {
            const pendingTasks = tasks.filter(t => t.estado === 'pendiente').length;
            const doneTasks = tasks.filter(t => t.estado === 'hecho').length;
            summaryData = `Tienes ${pendingTasks} tareas pendientes y ${doneTasks} completadas. En total, ${tasks.length} tareas.`;
        } else if (query.toLowerCase().includes('gasto')) {
            const total = expenses.reduce((sum, exp) => sum + exp.monto, 0);
            summaryData = `Has registrado ${expenses.length} gastos, con un total de €${total.toFixed(2)}.`;
        } else if (query.toLowerCase().includes('nota')) {
            summaryData = `Actualmente tienes ${notes.length} notas guardadas.`;
        } else {
            summaryData = "No he entendido bien la consulta. ¿Puedes ser más específico sobre tareas, gastos o notas?";
        }
        return await generateQueryResponse(summaryData);
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
                        prioridad: item.prioridad || settings.defaultPriority,
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
                return <Dashboard tasks={tasks} notes={notes} expenses={expenses} onNewItem={handleNewItem} onQuery={handleQuery} />;
            case 'Tasks':
                return <TasksView tasks={tasks} toggleTaskStatus={toggleTaskStatus} deleteTask={deleteTask} onEdit={handleEditItem} />;
            case 'Notes':
                return <NotesView notes={notes} deleteNote={deleteNote} onEdit={handleEditItem} />;
            case 'Expenses':
                return <ExpensesView expenses={expenses} deleteExpense={deleteExpense} onEdit={handleEditItem} />;
            case 'Calendar':
                return <CalendarView tasks={tasks} onEditTask={handleEditItem} />;
            case 'Settings':
                return <SettingsView 
                            currentTheme={theme} 
                            setTheme={setTheme} 
                            settings={settings} 
                            updateSettings={handleUpdateSettings}
                            clearAllData={handleClearAllData}
                        />;
            default:
                return <Dashboard tasks={tasks} notes={notes} expenses={expenses} onNewItem={handleNewItem} onQuery={handleQuery}/>;
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300">
            <Header activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-grow p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
                {renderContent()}
            </main>
            {isEditModalOpen && editingItem && (
                <EditModal item={editingItem} onClose={handleCloseModal} onUpdate={handleUpdateItem} />
            )}
        </div>
    );
};

export default App;
