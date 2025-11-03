import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GeminiResponse, Message } from '../types';
import { processUserInput } from '../services/geminiService';

interface ChatAssistantProps {
    onNewItem: (item: GeminiResponse) => void;
    onQuery: (query: string) => Promise<string>;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ onNewItem, onQuery }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isThinkingMode, setIsThinkingMode] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null); // For SpeechRecognition instance

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        setMessages([
            { sender: 'bot', text: '¡Hola, colega! Soy MemoryBro. Pide lo que necesites: "recuérdame llamar a mamá", "gasté 5€ en café" o "muéstrame mis tareas pendientes".' }
        ]);

        // Setup Speech Recognition
        // FIX: Cast window to any to access SpeechRecognition properties without TypeScript errors.
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'es-ES';
            recognitionRef.current = recognition;
        } else {
            console.warn("Speech recognition not supported in this browser.");
        }
    }, []);

    const handleSendMessage = useCallback(async (messageText: string) => {
        const trimmedInput = messageText.trim();
        if (!trimmedInput || isLoading) return;

        const userMessage: Message = { sender: 'user', text: trimmedInput };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const geminiResult = await processUserInput(trimmedInput, isThinkingMode);

            if (geminiResult.tipo === 'consulta') {
                const queryResponse = await onQuery(trimmedInput);
                const botMessage: Message = { sender: 'bot', text: queryResponse };
                setMessages(prev => [...prev, botMessage]);
            } else {
                onNewItem(geminiResult);
                let confirmationText = `¡Listo, colega! He anotado tu ${geminiResult.tipo}.`;
                if(geminiResult.contenido) {
                    confirmationText += ` "${geminiResult.contenido}"`;
                } else if (geminiResult.descripcion) {
                     confirmationText += ` "${geminiResult.descripcion}"`;
                }
                const botMessage: Message = { sender: 'bot', text: confirmationText, data: geminiResult };
                setMessages(prev => [...prev, botMessage]);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Algo ha ido mal, bro.';
            const botMessage: Message = { sender: 'bot', text: errorMessage };
            setMessages(prev => [...prev, botMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, isThinkingMode, onNewItem, onQuery]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(input);
    };

    const startRecording = () => {
        if (recognitionRef.current && !isRecording && !isLoading) {
            const recognition = recognitionRef.current;
            
            recognition.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0])
                    .map(result => result.transcript)
                    .join('');
                setInput(transcript);
            };

            recognition.onerror = (event: any) => {
                console.error("Error en el reconocimiento de voz:", event.error);
                setIsRecording(false);
            };
            
            recognition.start();
            setIsRecording(true);
        }
    };
    
    const stopRecordingAndSubmit = () => {
        if (recognitionRef.current && isRecording) {
            const recognition = recognitionRef.current;
            
            recognition.onend = () => {
                const finalTranscript = input.trim();
                if (finalTranscript) {
                    handleSendMessage(finalTranscript);
                }
                recognition.onend = null;
            };
            
            recognition.stop();
            setIsRecording(false);
        }
    };


    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg h-full flex flex-col border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Asistente MemoryBro</h2>
                <div className="flex items-center space-x-2">
                     <label htmlFor="thinking-mode" className="text-sm font-medium text-slate-600 dark:text-slate-300">Modo Pro</label>
                    <button
                        onClick={() => setIsThinkingMode(!isThinkingMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isThinkingMode ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                        id="thinking-mode"
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isThinkingMode ? 'translate-x-6' : 'translate-x-1'}`}/>
                    </button>
                </div>
            </div>

            <div className="flex-grow p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0 text-white font-bold">MB</div>}
                            <div
                                className={`max-w-md lg:max-w-lg rounded-xl px-4 py-2.5 ${
                                    msg.sender === 'user'
                                        ? 'bg-sky-600 text-white rounded-br-none'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
                                }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-end gap-2 justify-start">
                             <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0 text-white font-bold">MB</div>
                             <div className="max-w-md lg:max-w-lg rounded-xl px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none">
                                <div className="flex items-center space-x-1">
                                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                                </div>
                             </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isRecording ? "Escuchando..." : "Escribe aquí o mantén pulsado el micro"}
                        className="flex-grow bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-full py-2 px-4 focus:ring-sky-500 focus:border-sky-500"
                        disabled={isLoading}
                    />
                     <button
                        type="button"
                        onMouseDown={startRecording}
                        onMouseUp={stopRecordingAndSubmit}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecordingAndSubmit}
                        disabled={isLoading}
                        className={`flex-shrink-0 text-white rounded-full p-2.5 transition-colors ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-sky-600 hover:bg-sky-700'} disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed`}
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm-1 4a1 1 0 00-2 0v2a1 1 0 102 0V8zm10 0a1 1 0 10-2 0v2a1 1 0 102 0V8zm-7 4a1 1 0 00-1 1v.083A4.982 4.982 0 005 17a1 1 0 102 0A3 3 0 0110 14a3 3 0 013 3a1 1 0 102 0a4.982 4.982 0 00-2.083-4.083V13a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="flex-shrink-0 bg-sky-600 text-white rounded-full p-2.5 hover:bg-sky-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatAssistant;
