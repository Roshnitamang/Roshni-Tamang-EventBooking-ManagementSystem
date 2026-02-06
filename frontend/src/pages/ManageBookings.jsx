import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';

const ManageBookings = () => {
    const { eventId } = useParams();
    const { backendUrl } = useContext(AppContent);
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
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Event Bookings</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
                        <tr>
                            <th className="py-3 px-4">User</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Tickets</th>
                            <th className="py-3 px-4">Amount</th>
                            <th className="py-3 px-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-4 px-4 text-center text-gray-500">No bookings yet.</td>
                            </tr>
                        ) : (
                            bookings.map(booking => (
                                <tr key={booking._id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4">{booking.userId?.name || 'Unknown'}</td>
                                    <td className="py-3 px-4">{booking.userId?.email || '-'}</td>
                                    <td className="py-3 px-4">{booking.tickets}</td>
                                    <td className="py-3 px-4">${booking.totalAmount}</td>
                                    <td className="py-3 px-4">{new Date(booking.createdAt).toLocaleDateString()}</td>
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
