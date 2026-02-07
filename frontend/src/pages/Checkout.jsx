import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';

const Checkout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { backendUrl, isLoggedin, userData } = useContext(AppContent);
    const [event, setEvent] = useState(null);
    const [tickets, setTickets] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (!isLoggedin) {
            navigate('/login', { state: { from: 'checkout', message: "Please login to continue to checkout", mode: 'login' } });
            return;
        }

        const fetchEvent = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/events/${id}`);
                if (data.success) {
                    setEvent(data.event);
                }
            } catch (error) {
                toast.error("Error loading checkout details");
            }
        };
        fetchEvent();

        if (userData) {
            const names = userData.name.split(' ');
            setFirstName(names[0] || '');
            setLastName(names.slice(1).join(' ') || '');
            setEmail(userData.email || '');
        }
    }, [id, backendUrl, isLoggedin, navigate, userData]);

    const handleConfirmBooking = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('eventId', id);
            formData.append('tickets', tickets);
            formData.append('bookingType', 'personal'); // Simplified for now

            const { data } = await axios.post(`${backendUrl}/api/bookings/book`,
                formData,
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );

            if (data.success) {
                navigate('/my-bookings', { state: { message: "Order successful! Your tickets have been sent to your email." } });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Booking failed");
        } finally {
            setLoading(false);
        }
    };

    if (!event) return <div className="p-20 text-center font-bold text-gray-400">Loading checkout...</div>;

    const total = (event.price * tickets).toFixed(2);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] py-12">
            <div className="max-w-6xl mx-auto px-6">

                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-10 tracking-tight">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* LEFT: Checkout Form */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. Ticket Selection */}
                        <div className="bg-white dark:bg-[#1a1a1c] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">1</span>
                                Select Tickets
                            </h2>
                            <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">General Admission</p>
                                    <p className="text-sm text-gray-500">{event.price > 0 ? `$${event.price} per ticket` : 'Free'}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setTickets(t => Math.max(1, t - 1))}
                                        className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition"
                                    >-</button>
                                    <span className="font-black text-lg w-6 text-center">{tickets}</span>
                                    <button
                                        onClick={() => setTickets(t => Math.min(event.ticketsAvailable, t + 1))}
                                        className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition"
                                    >+</button>
                                </div>
                            </div>
                        </div>

                        {/* 2. Contact Information */}
                        <form onSubmit={handleConfirmBooking} className="bg-white dark:bg-[#1a1a1c] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">2</span>
                                Contact Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-gray-400">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500 transition outline-none dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-gray-400">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500 transition outline-none dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 mb-8">
                                <label className="text-xs font-black uppercase text-gray-400">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500 transition outline-none dark:text-white"
                                />
                                <p className="text-[10px] text-gray-400 font-bold mt-2">Tickets will be sent to this email address once the order is confirmed.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition shadow-xl shadow-blue-500/20 disabled:opacity-50"
                            >
                                {loading ? 'Processing Order...' : `Place Order • $${total}`}
                            </button>
                        </form>
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="relative">
                        <div className="sticky top-24 bg-white dark:bg-[#1a1a1c] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
                            <div className="aspect-[2/1]">
                                <img src={event.image && event.image.startsWith('/uploads') ? backendUrl + event.image : event.image} alt={event.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-8">
                                <h3 className="font-black text-gray-900 dark:text-white mb-2 leading-tight">{event.title}</h3>
                                <p className="text-sm font-bold text-gray-500 mb-6">
                                    {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                </p>

                                <div className="space-y-4 pt-6 border-t border-gray-50 dark:border-gray-800">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">{tickets} x General Admission</span>
                                        <span className="font-black text-gray-900 dark:text-white">${total}</span>
                                    </div>
                                    <div className="flex justify-between text-lg pt-4 border-t border-gray-50 dark:border-gray-800">
                                        <span className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">Total</span>
                                        <span className="font-black text-3xl text-gray-900 dark:text-white">${total}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-6">
                                <p className="text-[10px] text-center font-bold text-gray-400 leading-relaxed uppercase tracking-widest">
                                    Powered by Antigravity Events
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;
