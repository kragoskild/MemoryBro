import React from 'react';
import { Task, Note, Expense } from '../types';
import ChatAssistant from './ChatAssistant';
import TasksWidget from './widgets/TasksWidget';
import NotesWidget from './widgets/NotesWidget';
import ExpensesWidget from './widgets/ExpensesWidget';
import { GeminiResponse } from '../types';

interface DashboardProps {
    tasks: Task[];
    notes: Note[];
    expenses: Expense[];
    onNewItem: (item: GeminiResponse) => void;
    onQuery: (query: string) => Promise<string>;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, notes, expenses, onNewItem, onQuery }) => {
    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 h-[75vh] lg:h-[78vh]">
                <ChatAssistant onNewItem={onNewItem} onQuery={onQuery} />
            </div>
            <div className="flex flex-col gap-6">
                <TasksWidget tasks={tasks.filter(t => t.estado === 'pendiente').slice(0, 3)} />
                <ExpensesWidget expenses={expenses.slice(0, 3)} />
                <NotesWidget notes={notes.slice(0, 3)} />
            </div>
        </div>
    );
};

export default Dashboard;