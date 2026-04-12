import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, Ticket, ChevronRight, CheckCircle2, Package, History } from 'lucide-react';

const MyBookings = () => {
    const { backendUrl, currency } = useContext(AppContent);
    const [bookings, setBookings] = useState([]);

    const location = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        if (location.state?.message) {
            setModalMessage(location.state.message);
            setShowModal(true);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const fetchBookings = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/bookings/my-bookings`, {
                withCredentials: true
            });
            if (data.success) {
                setBookings(data.bookings);
            }
        } catch (error) {
            toast.error("Failed to load bookings");
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [backendUrl]);

    return (
        <div className="min-h-screen bg-transparent py-24 px-6 relative transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-16">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-12">
                   <div>
                       <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20 rotate-3">
                             <History className="text-zinc-900 dark:text-white w-6 h-6" />
                          </div>
                          <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">Order Treasury</h1>
                       </div>
                       <p className="text-zinc-500 font-medium text-lg">Detailed ledger of your secured experience allocations.</p>
                   </div>
                   <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-5 py-2 rounded-full border border-emerald-500/20 shadow-2xl">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">{bookings.length} POSITIONS SECURED</span>
                   </div>
                </header>

                <div className="grid gap-6">
                    {bookings.length === 0 ? (
                        <div className="py-32 text-center bg-white dark:bg-zinc-900/30 rounded-[3rem] border border-dashed border-zinc-900 group">
                           <Package className="w-16 h-16 text-zinc-800 mx-auto mb-6 group-hover:text-emerald-500 transition-colors duration-500" />
                           <p className="text-zinc-500 font-black uppercase tracking-[0.4em] text-sm">No Transactional Records Detected</p>
                        </div>
                    ) : (
                        bookings.map((booking) => (
                            <motion.div 
                               initial={{ opacity: 0, x: -20 }}
                               animate={{ opacity: 1, x: 0 }}
                               key={booking._id} 
                               className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl hover:border-emerald-500/20 transition-all duration-300 flex flex-col md:flex-row justify-between items-center group"
                            >
                                <div className="space-y-6 w-full md:w-auto">
                                    <div className="flex items-center gap-2 mb-2">
                                       <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                                       <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Logged: {new Date(booking.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white group-hover:text-emerald-400 Transition-colors uppercase tracking-tight leading-none mb-4">{booking.eventId?.title || "PROTOCOL UNKNOWN"}</h2>
                                    <div className="flex flex-wrap items-center gap-6">
                                       <div className="flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                          <span className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{booking.tickets} Allocation Units</span>
                                       </div>
                                       <div className="text-lg font-black text-emerald-500 tracking-tighter">
                                          {currency}{booking.totalAmount}
                                       </div>
                                    </div>
                                </div>
                                <div className="mt-8 md:mt-0 flex items-center gap-4">
                                     <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border shadow-2xl ${
                                         booking.status === 'booked' 
                                         ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                         : 'bg-red-500/10 text-red-500 border-red-500/20'
                                     }`}>
                                         {booking.status === 'booked' ? 'Confirmed' : 'Deficit'}
                                     </span>
                                     <div className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-700 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all">
                                        <ChevronRight className="w-5 h-5" />
                                     </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* SUCCESS MODAL - Premium Glass Experience */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                        ></motion.div>
                        
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="bg-white dark:bg-zinc-900 rounded-[4rem] p-12 max-w-md w-full shadow-[0_30px_100px_rgba(0,0,0,0.8)] text-center border border-zinc-200 dark:border-white/5 relative z-10 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                            
                            <div className="w-24 h-24 bg-transparent border border-emerald-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl rotate-3">
                                <Sparkles className="w-10 h-10 text-emerald-500" />
                            </div>
                            
                            <h3 className="text-4xl font-black text-zinc-900 dark:text-white mb-4 uppercase tracking-tighter leading-none italic">Protocol Success</h3>
                            <div className="flex items-center justify-center gap-2 mb-8">
                               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                               <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.5em]">Transaction Secured</p>
                            </div>
                            
                            <p className="text-zinc-500 text-lg font-medium leading-relaxed mb-12">
                                {modalMessage}
                            </p>
                            
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-6 bg-emerald-600 text-zinc-900 dark:text-white font-black uppercase tracking-[0.4em] text-xs rounded-[2.5rem] hover:bg-emerald-500 transition-all shadow-2xl active:scale-95"
                            >
                                Re-enter Vault
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyBookings;

