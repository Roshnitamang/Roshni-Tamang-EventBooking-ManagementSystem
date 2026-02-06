import { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { AppContent } from '../context/AppContext'

const AttendeeDashboard = () => {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'bookings'
  const { backendUrl, userData } = useContext(AppContent);

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/events`, {
        params: { search, category }
      });
      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/bookings/my-bookings`, {
        withCredentials: true
      });
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error.message);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [backendUrl]);

  const upcomingBookings = bookings.filter(b => new Date(b.eventId?.date) >= new Date());
  const pastBookings = bookings.filter(b => new Date(b.eventId?.date) < new Date());

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            My Tickets
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 uppercase text-xs font-bold tracking-widest">
            Manage your booked events and experiences
          </p>
        </div>
        <Link
          to="/"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-500/30 transition flex items-center gap-2"
        >
          <span>Find more events</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </Link>
      </div>

      {/* Bookings View */}
      <div className="space-y-12">
        {/* Upcoming */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upcoming Events</h2>
            <span className="bg-green-100 text-green-700 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-tighter">
              {upcomingBookings.length}
            </span>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-gray-400">No upcoming bookings. Start exploring!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking._id} booking={booking} />
              ))}
            </div>
          )}
        </section>

        {/* Past */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold text-gray-400 dark:text-gray-500">Past Experiences</h2>
          </div>
          {pastBookings.length === 0 ? (
            <p className="text-gray-400 italic text-sm">No past bookings found.</p>
          ) : (
            <div className="grid gap-6 opacity-75">
              {pastBookings.map((booking) => (
                <BookingCard key={booking._id} booking={booking} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

const BookingCard = ({ booking }) => {
  const { eventId, tickets, totalAmount, createdAt } = booking;
  if (!eventId) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 p-6 rounded-xl shadow-sm flex flex-col md:flex-row gap-6 items-center">
      {eventId.image && <img src={eventId.image} alt={eventId.title} className="w-24 h-24 object-cover rounded-lg" />}
      <div className="flex-1">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{eventId.title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Date</p>
            <p className="font-medium dark:text-gray-200">{new Date(eventId.date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Tickets</p>
            <p className="font-medium dark:text-gray-200">{tickets} Tickets</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Total Paid</p>
            <p className="font-bold text-blue-600">${totalAmount}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Booked On</p>
            <p className="dark:text-gray-300">{new Date(createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      <Link to={`/event/${eventId._id}`} className="border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-lg text-sm font-medium transition">
        Event Page
      </Link>
    </div>
  )
}

export default AttendeeDashboard
