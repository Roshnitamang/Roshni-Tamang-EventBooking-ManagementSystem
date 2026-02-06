import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';

const MyBookings = () => {
    const { backendUrl } = useContext(AppContent);
    const [bookings, setBookings] = useState([]);

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
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">My Bookings</h1>
            <div className="grid gap-4 max-w-4xl mx-auto">
                {bookings.length === 0 ? (
                    <p className="text-gray-500 text-center">No bookings found.</p>
                ) : (
                    bookings.map((booking) => (
                        <div key={booking._id} className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row justify-between items-center">
                            <div>
                                <h2 className="text-xl font-semibold">{booking.eventId?.title || "Unknown Event"}</h2>
                                <p className="text-gray-600">
                                    {booking.tickets} Ticket(s) • Total: ${booking.totalAmount}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Booked on: {new Date(booking.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm ${booking.status === 'booked' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {booking.status}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyBookings;
