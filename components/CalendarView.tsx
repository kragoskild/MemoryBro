import React, { useState } from 'react';
import { Task, Priority, EditableItem } from '../types';

interface CalendarViewProps {
    tasks: Task[];
    onEditTask: (task: EditableItem) => void;
}

const priorityStyles: { [key in Priority]: string } = {
    [Priority.ALTA]: 'bg-red-500/80 hover:bg-red-600/80 text-white',
    [Priority.MEDIA]: 'bg-yellow-400/80 hover:bg-yellow-500/80 text-yellow-900',
    [Priority.BAJA]: 'bg-green-500/80 hover:bg-green-600/80 text-white',
};

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onEditTask }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDayOfWeek = startOfMonth.getDay(); // 0 (Sun) - 6 (Sat), adjusting for Monday start
    const daysInMonth = endOfMonth.getDate();

    const calendarDays = [];
    
    // Adjust startDayOfWeek for Monday start (0=Mon, 6=Sun)
    const adjustedStartDay = (startDayOfWeek === 0) ? 6 : startDayOfWeek - 1;

    // Days from previous month
    for (let i = 0; i < adjustedStartDay; i++) {
        calendarDays.push({ key: `prev-${i}`, date: null, tasks: [] });
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateString = date.toISOString().split('T')[0];
        const dayTasks = tasks.filter(task => task.fecha_vencimiento && task.fecha_vencimiento.startsWith(dateString));
        calendarDays.push({ key: `current-${day}`, date, tasks: dayTasks });
    }

    // Days from next month to fill grid
    const remainingSlots = 7 - (calendarDays.length % 7);
    if (remainingSlots < 7) {
        for (let i = 0; i < remainingSlots; i++) {
            calendarDays.push({ key: `next-${i}`, date: null, tasks: [] });
        }
    }
    
    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Calendario</h1>
                <div className="flex items-center space-x-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </button>
                    <h2 className="text-xl font-semibold text-center w-48 capitalize">
                        {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="grid grid-cols-7 gap-1 text-center font-semibold text-sm text-slate-500 dark:text-slate-400 mb-2">
                    {weekDays.map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map(({ key, date, tasks }) => {
                         const isToday = date && date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                        return (
                            <div key={key} className={`h-32 rounded bg-slate-50 dark:bg-slate-800/50 p-1.5 overflow-y-auto ${date ? 'border border-slate-200 dark:border-slate-700/50' : 'bg-transparent'}`}>
                                {date && (
                                    <span className={`text-xs font-bold ${isToday ? 'bg-sky-500 text-white rounded-full flex items-center justify-center h-6 w-6' : 'text-slate-600 dark:text-slate-300'}`}>
                                        {date.getDate()}
                                    </span>
                                )}
                                <div className="mt-1 space-y-1">
                                    {tasks.map(task => (
                                        <div 
                                            key={task.id} 
                                            onClick={() => onEditTask(task)}
                                            className={`p-1.5 rounded text-xs cursor-pointer truncate transition-transform hover:scale-105 ${priorityStyles[task.prioridad]}`}
                                        >
                                            {task.contenido}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
