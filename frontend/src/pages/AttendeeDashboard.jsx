import { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { AppContent } from '../context/AppContext'
import OpenSourceMap from '../components/OpenSourceMap'
import { MapPin, Calendar, Ticket, CreditCard, ChevronDown, ChevronUp } from 'lucide-react'

const AttendeeDashboard = () => {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'bookings'
  const { backendUrl, userData, currency } = useContext(AppContent);

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
  const { backendUrl, currency } = useContext(AppContent);
  const [showMap, setShowMap] = useState(false);
  const { eventId, tickets, totalAmount, createdAt } = booking;
  if (!eventId) return null;

  return (
    <div className="bg-white dark:bg-[#1a1a1c] border dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border-gray-100">
      <div className="p-6 flex flex-col md:flex-row gap-8 items-center">
        {/* Event Poster */}
        <div className="w-full md:w-48 h-32 relative rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
          <img
            src={eventId.image && eventId.image.startsWith('/uploads') ? backendUrl + eventId.image : eventId.image}
            alt={eventId.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h3 className="font-black text-2xl text-gray-900 dark:text-white tracking-tight">{eventId.title}</h3>
            <div className="flex gap-2">
              <Link to={`/event/${eventId._id}`} className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition whitespace-nowrap">
                Event Page
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Date</p>
                <p className="text-sm font-bold dark:text-gray-200">{new Date(eventId.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Ticket className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Quantity</p>
                <p className="text-sm font-bold dark:text-gray-200">{tickets} Tickets</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CreditCard className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Paid</p>
                <p className="text-sm font-black text-blue-600">{currency}{totalAmount}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Location</p>
                <div className="flex flex-col">
                  <p className="text-sm font-bold dark:text-gray-200 truncate">{eventId.location}</p>
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className="text-[10px] text-blue-600 font-bold uppercase tracking-widest hover:underline text-left mt-1 flex items-center gap-1"
                  >
                    {showMap ? <><ChevronUp className="w-3 h-3" /> Hide Map</> : <><ChevronDown className="w-3 h-3" /> View on Map</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      {showMap && (
        <div className="border-t border-gray-50 dark:border-gray-800 p-4 bg-gray-50 dark:bg-[#151517] animate-in fade-in slide-in-from-top-4 duration-300">
          <OpenSourceMap
            latitude={eventId.coordinates?.latitude}
            longitude={eventId.coordinates?.longitude}
            address={eventId.location}
            height="250px"
          />
        </div>
      )}
    </div>
  )
}

export default AttendeeDashboard
