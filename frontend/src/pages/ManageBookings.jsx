import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';

const ManageBookings = () => {
    const { eventId } = useParams();
    const { backendUrl, currency } = useContext(AppContent);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/organizer/event-bookings/${eventId}`, {
                    withCredentials: true
                });
                if (data.success) {
                    setBookings(data.bookings);
                }
            } catch (error) {
                toast.error("Failed to load bookings");
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [eventId, backendUrl]);

    if (loading) return <div className="p-10 text-center">Loading bookings...</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto transition-colors duration-300">
            <h1 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-zinc-900 dark:text-white">Event Bookings</h1>

            <div className="bg-transparent dark:bg-white dark:bg-zinc-900 rounded-lg shadow dark:border dark:border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-500 dark:text-zinc-400 uppercase text-sm">
                        <tr>
                            <th className="py-3 px-4">User</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Tickets</th>
                            <th className="py-3 px-4">Amount</th>
                            <th className="py-3 px-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-4 px-4 text-center text-zinc-500">No bookings yet.</td>
                            </tr>
                        ) : (
                            bookings.map(booking => (
                                <tr key={booking._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                    <td className="py-3 px-4 dark:text-zinc-600 dark:text-zinc-300">{booking.userId?.name || 'Unknown'}</td>
                                    <td className="py-3 px-4 dark:text-zinc-500 dark:text-zinc-400">{booking.userId?.email || '-'}</td>
                                    <td className="py-3 px-4 dark:text-zinc-600 dark:text-zinc-300">{booking.tickets}</td>
                                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100 dark:text-zinc-900 dark:text-white">{currency}{booking.totalAmount}</td>
                                    <td className="py-3 px-4 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400">{new Date(booking.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageBookings;

