import React, { useState, useRef, useEffect } from 'react';
import { Message, GeminiResponse } from '../types';
import { processUserInput } from '../services/geminiService';

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let recognition: any | null = null;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
}

interface ChatAssistantProps {
    onNewItem: (item: GeminiResponse) => void;
    onQuery: (query: string) => Promise<string>;
}

const ThinkingModeToggle: React.FC<{ isThinkingMode: boolean; setIsThinkingMode: (value: boolean) => void; disabled: boolean }> = ({ isThinkingMode, setIsThinkingMode, disabled }) => (
    <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
        <span>⚡️ Rápido</span>
        <label htmlFor="thinking-mode-toggle" className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input 
                type="checkbox" 
                id="thinking-mode-toggle" 
                className="sr-only peer" 
                checked={isThinkingMode}
                onChange={() => setIsThinkingMode(!isThinkingMode)}
                disabled={disabled}
            />
            <div className="w-9 h-5 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-sky-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
        <span>🤔 Pensando</span>
    </div>
);

const ChatAssistant: React.FC<ChatAssistantProps> = ({ onNewItem, onQuery }) => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: "¿Qué pasa, colega? Dime qué tienes en mente. Yo me encargo del resto." }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isThinkingMode, setIsThinkingMode] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleListen = () => {
        if (!recognition) return;

        if (isListening) {
            recognition.stop();
            setIsListening(false);
            return;
        }

        setIsListening(true);
        recognition.start();

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setUserInput(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
    };

    const handleSend = async () => {
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: Message = { sender: 'user', text: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);

        try {
            const result = await processUserInput(currentInput, isThinkingMode);
            
            if (result.tipo === 'consulta') {
                const friendlyResponse = await onQuery(result.contenido || currentInput);
                const newBotMessage: Message = { sender: 'bot', text: friendlyResponse };
                setMessages(prev => [...prev, newBotMessage]);
            } else {
                const confirmationText = `¡Listo, colega! He añadido tu nuevo ${result.tipo}. ¿Algo más?`;
                const newBotMessage: Message = { sender: 'bot', text: confirmationText, data: result };
                setMessages(prev => [...prev, newBotMessage]);
                onNewItem(result);
            }

        } catch (error: any) {
            const errorMessage: Message = { sender: 'bot', text: error.message || "Uups, colega. Algo ha salido mal." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg flex flex-col h-full border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Chatea con MemoryBro</h2>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="flex flex-col space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`px-4 py-2 rounded-lg max-w-xs md:max-w-md ${msg.sender === 'user' ? 'bg-sky-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-end justify-start">
                            <div className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                                <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse delay-150"></div>
                                <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse delay-300"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ej: Recuérdame llamar a mamá mañana a las 8pm"
                            className="flex-grow bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            disabled={isLoading}
                        />
                        {recognition && (
                            <button
                                onClick={handleListen}
                                disabled={isLoading}
                                className={`p-2 rounded-md font-semibold transition-colors ${
                                    isListening 
                                    ? 'bg-red-600 hover:bg-red-500' 
                                    : 'bg-slate-600 hover:bg-slate-500'
                                } text-white disabled:bg-slate-700 disabled:cursor-not-allowed`}
                                aria-label="Grabar voz"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 13a1 1 0 112 0v-2.01a1 1 0 112 0v2.01a3 3 0 11-6 0v-2.01a1 1 0 112 0v2.01z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !userInput.trim()}
                            className="bg-sky-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                        >
                            Enviar
                        </button>
                    </div>
                    <ThinkingModeToggle isThinkingMode={isThinkingMode} setIsThinkingMode={setIsThinkingMode} disabled={isLoading} />
                </div>
            </div>
        </div>
    );
};

export default ChatAssistant;