import React, { useState } from 'react';
import { MessageSquare, Github, Twitter, Instagram } from 'lucide-react';
import ChatWidget from './ChatWidget';

const Footer = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <>
            <footer className="bg-zinc-950 border-t border-zinc-900/50 py-24 relative overflow-hidden">
                {/* Subtle light leak for modern look */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -mt-64"></div>
                
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-12 relative z-10">
                    <div className="col-span-2 md:col-span-2">
                        <div className="flex items-center gap-2 mb-8 group cursor-pointer w-fit">
                            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-900/20">
                                <div className="font-black text-white text-lg">P</div>
                            </div>
                            <span className="tracking-widest text-xl font-black text-white">PLANORA</span>
                        </div>
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mb-8">
                            Premium marketplace for discovering and managing world-class events. Redefining how you experience the world.
                        </p>
                        <div className="flex gap-4">
                            <button className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-emerald-500 hover:border-emerald-500/50 transition-all">
                                <Github className="w-4 h-4" />
                            </button>
                            <button className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-emerald-500 hover:border-emerald-500/50 transition-all">
                                <Twitter className="w-4 h-4" />
                            </button>
                            <button className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-emerald-500 hover:border-emerald-500/50 transition-all">
                                <Instagram className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="font-black mb-8 uppercase tracking-[0.2em] text-[10px] text-zinc-400">Creation</h4>
                        <ul className="space-y-4 text-xs font-bold text-zinc-600">
                            <li className="hover:text-emerald-500 cursor-pointer transition">Create Event</li>
                            <li className="hover:text-emerald-500 cursor-pointer transition">Organizer Hub</li>
                            <li className="hover:text-emerald-500 cursor-pointer transition">Pricing</li>
                            <li className="hover:text-emerald-500 cursor-pointer transition">Checkin App</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-black mb-8 uppercase tracking-[0.2em] text-[10px] text-zinc-400">Account</h4>
                        <ul className="space-y-4 text-xs font-bold text-zinc-600">
                            <li className="hover:text-emerald-500 cursor-pointer transition">My Dashboard</li>
                            <li className="hover:text-emerald-500 cursor-pointer transition">Profile Settings</li>
                            <li className="hover:text-emerald-500 cursor-pointer transition">Order History</li>
                            <li className="hover:text-emerald-500 cursor-pointer transition">Become Partner</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-black mb-8 uppercase tracking-[0.2em] text-[10px] text-zinc-400">Legal</h4>
                        <ul className="space-y-4 text-xs font-bold text-zinc-600">
                            <li className="hover:text-emerald-500 cursor-pointer transition">Privacy Policy</li>
                            <li className="hover:text-emerald-500 cursor-pointer transition">Terms of Use</li>
                            <li className="hover:text-emerald-500 cursor-pointer transition">Cookie Policy</li>
                        </ul>
                    </div>
                </div>
                
                <div className="max-w-7xl mx-auto px-6 mt-24 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">© 2026 PLANORA. ALL RIGHTS RESERVED.</p>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">System Functional</span>
                    </div>
                </div>
            </footer>

            {/* AI Chat Widget */}
            <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

            {/* Floating Assistance Button */}
            <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="fixed bottom-10 right-10 flex items-center gap-3 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 rounded-full border border-zinc-800 shadow-2xl z-50 group hover:-translate-y-1 transition-all duration-300"
            >
                <div className="relative">
                    <MessageSquare className="w-5 h-5 text-emerald-500 group-hover:rotate-12 transition-transform" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                </div>
                <span className="text-xs font-black uppercase tracking-widest">Inquiry Center</span>
            </button>
        </>
    );
};

export default Footer;
