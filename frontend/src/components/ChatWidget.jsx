import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare, Sparkles, User, Bot, Loader2 } from 'lucide-react';

const ChatWidget = ({ isOpen, onClose }) => {
    const { backendUrl, userData } = useContext(AppContent);
    const [messages, setMessages] = useState([
        { role: 'ai', content: `Hello ${userData?.name || 'there'}! I'm your Planora Assistant. How can I help you discover your next great experience today?` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            // Filter history: Gemini requires history to start with a 'user' message.
            // Our first message is an AI greeting, so we skip it for the API history.
            const apiHistory = messages
                .filter((_, index) => index > 0) // Skip the initial bot greeting
                .map(m => ({
                    role: m.role === 'ai' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }));

            const { data } = await axios.post(`${backendUrl}/api/ai/chat`, {
                message: userMessage,
                history: apiHistory
            });

            if (data.success) {
                setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', content: data.message || "I'm sorry, I'm having trouble connecting right now. Please try again later." }]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: 'ai', content: "Connection lost. Please check your internet or try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed bottom-28 right-6 md:right-10 w-[90vw] md:w-[400px] h-[600px] max-h-[70vh] bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl z-[60] flex flex-col overflow-hidden backdrop-blur-xl"
                >
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-r from-emerald-600 to-emerald-900 flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-zinc-950/20 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center relative">
                                <Sparkles className="w-5 h-5 text-white" />
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-emerald-900 animate-pulse"></span>
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white tracking-widest uppercase mb-0.5">Planora AI</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-black tracking-widest text-emerald-300 uppercase">Always Active</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-zinc-950/20">
                        {messages.map((m, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: m.role === 'ai' ? -10 : 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={i}
                                className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'} items-end gap-2`}
                            >
                                {m.role === 'ai' && (
                                    <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-1 flex-shrink-0">
                                        <Bot className="w-4 h-4 text-emerald-500" />
                                    </div>
                                )}
                                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed
                                    ${m.role === 'ai' 
                                        ? 'bg-zinc-800 text-zinc-300 rounded-bl-none border border-zinc-700/50' 
                                        : 'bg-emerald-600 text-white rounded-br-none shadow-lg shadow-emerald-900/20'}`}
                                >
                                    {m.content}
                                </div>
                                {m.role === 'user' && (
                                    <div className="w-7 h-7 rounded-lg bg-emerald-700 border border-emerald-500/50 flex items-center justify-center mb-1 flex-shrink-0">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                        {loading && (
                            <div className="flex justify-start items-end gap-2">
                                <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-1">
                                    <Bot className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="bg-zinc-800 text-zinc-300 px-4 py-3 rounded-2xl rounded-bl-none border border-zinc-700/50">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-6 bg-zinc-900 border-t border-zinc-800">
                        <div className="relative group">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about events, venues, tickets..."
                                className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500/50 rounded-2xl px-5 py-3.5 pr-12 outline-none text-zinc-100 font-bold text-xs tracking-tight transition-all placeholder:text-zinc-600 focus:shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all disabled:opacity-30 active:scale-95 shadow-lg shadow-emerald-900/20"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-center text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] mt-4">
                            Powered by Gemini AI
                        </p>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ChatWidget;
