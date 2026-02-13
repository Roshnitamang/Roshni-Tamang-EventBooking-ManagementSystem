import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

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

    useEffect(() => {
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
        fetchBookings();
    }, [backendUrl]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 transition-colors duration-300 relative">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">My Bookings</h1>
            <div className="grid gap-4 max-w-4xl mx-auto">
                {bookings.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center">No bookings found.</p>
                ) : (
                    bookings.map((booking) => (
                        <div key={booking._id} className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow dark:border dark:border-gray-800 flex flex-col md:flex-row justify-between items-center transition-all">
                            <div>
                                <h2 className="text-xl font-semibold dark:text-white">{booking.eventId?.title || "Unknown Event"}</h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {booking.tickets} Ticket(s) • Total: {currency}{booking.totalAmount}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Booked on: {new Date(booking.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${booking.status === 'booked' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                                }`}>
                                {booking.status}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* MODAL */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl text-center"
                        >
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Success!</h3>
                            <p className="text-gray-500 dark:text-gray-300 mb-6">{modalMessage}</p>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
                            >
                                Okay, got it
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyBookings;
