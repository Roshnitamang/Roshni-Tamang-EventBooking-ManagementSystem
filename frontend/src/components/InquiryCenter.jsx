import React, { useState, useEffect, useContext } from 'react';
import { MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWidget from './ChatWidget';

const InquiryCenter = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    // Visibility Logic
    const showPaths = [
        '/dashboard',
        '/admin-dashboard',
        '/super-admin-dashboard',
        '/organizer-dashboard',
        '/my-bookings',
        '/profile',
        '/help',
        '/all-events',
        '/event/' // For dynamic event routes
    ];

    const hidePaths = [
        '/login',
        '/register',
        '/payment',
        '/checkout',
        '/kyc',
        '/chat'
    ];

    const shouldShow = showPaths.some(path => location.pathname.includes(path)) && 
                     !hidePaths.some(path => location.pathname.includes(path));

    // Scroll Behavior
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!shouldShow) return null;

    return (
        <>
            {/* Chat Widget Container */}
            <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

            {/* Floating Toggle Button */}
            <motion.div
                className="fixed z-[999] transition-all duration-500 ease-in-out"
                style={{
                    bottom: 'var(--floating-bottom)',
                    right: 'var(--floating-right)',
                }}
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ 
                    opacity: 1, 
                    scale: isScrolled ? 0.9 : 1, 
                    y: 0 
                }}
                whileHover={{ scale: isScrolled ? 1 : 1.05 }}
            >
                <motion.button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    layout
                    className={`
                        flex items-center gap-3 bg-zinc-900 dark:bg-zinc-900 
                        text-white border border-zinc-800/50 dark:border-zinc-700/50
                        shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl
                        transition-all duration-500 overflow-hidden group
                        ${isChatOpen ? 'rounded-2xl px-4 py-4 bg-emerald-600 border-emerald-500' : 'rounded-full p-4 md:px-6 md:py-4'}
                    `}
                >
                    <div className="relative shrink-0">
                        <MessageSquare 
                            className={`w-5 h-5 transition-all duration-500 ${isChatOpen ? 'rotate-90 text-white' : 'text-emerald-500 group-hover:rotate-12'}`} 
                        />
                        {!isChatOpen && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                        )}
                    </div>

                    <AnimatePresence>
                        {(!isScrolled || isChatOpen) && (
                            <motion.span
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 'auto', opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden"
                            >
                                {isChatOpen ? 'Close Assistant' : 'Inquiry Center'}
                            </motion.span>
                        )}
                    </AnimatePresence>

                    {/* Desktop Hover Expansion (when not scrolled) */}
                    <div className="hidden lg:group-hover:flex items-center gap-3">
                        {isScrolled && !isChatOpen && (
                            <motion.span
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 'auto', opacity: 1 }}
                                className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden"
                            >
                                Inquiry Center
                            </motion.span>
                        )}
                    </div>
                </motion.button>

                {/* Status Dot for Premium Feel */}
                {!isChatOpen && (
                    <div className="absolute -top-1 -left-1 flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30"></div>
                    </div>
                )}
            </motion.div>

            {/* Global CSS for spacing variables */}
            <style dangerouslySetInnerHTML={{ __html: `
                :root {
                    --floating-bottom: 24px;
                    --floating-right: 24px;
                }
                @media (max-width: 1024px) {
                    :root {
                        --floating-bottom: 20px;
                        --floating-right: 20px;
                    }
                }
                @media (max-width: 640px) {
                    :root {
                        --floating-bottom: 16px;
                        --floating-right: 16px;
                    }
                }
            ` }} />
        </>
    );
};

export default InquiryCenter;
