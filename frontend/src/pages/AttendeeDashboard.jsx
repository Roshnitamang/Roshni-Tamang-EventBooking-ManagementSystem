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
  const { backendUrl, userData, currency, locationSearch } = useContext(AppContent);

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/events`, {
        params: { search, category, location: locationSearch }
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
    fetchEvents();
    fetchBookings();
  }, [backendUrl, search, category, locationSearch]);

  const upcomingBookings = bookings.filter(b => b.eventId && new Date(b.eventId.date) >= new Date());
  const pastBookings = bookings.filter(b => b.eventId && new Date(b.eventId.date) < new Date());

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-[#0f0f10]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            User Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 uppercase text-[10px] font-black tracking-[0.2em]">
            {activeTab === 'browse' ? 'Discover and explore upcoming experiences' : 'Manage your booked events and experiences'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'browse' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-xl' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Browse Events
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'bookings' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-xl' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            My Tickets
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Search/Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-6 py-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-6 py-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-sm"
            >
              <option value="">All Categories</option>
              <option value="Music">Music</option>
              <option value="Nightlife">Nightlife</option>
              <option value="Health">Health</option>
              <option value="Holidays">Holidays</option>
              <option value="Hobbies">Hobbies</option>
              <option value="Business">Business</option>
              <option value="Food">Food</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white dark:bg-gray-800 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-gray-400 font-medium">No events found matching your search.</p>
              </div>
            ) : (
              events.map((event) => (
                <Link
                  key={event._id}
                  to={`/event/${event._id}`}
                  className="group bg-white dark:bg-gray-800 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img
                      src={event.image && event.image.startsWith('/uploads') ? backendUrl + event.image : event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-blue-600">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{event.title}</h3>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-medium mb-4">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
                      <span className="text-xl font-black text-gray-900 dark:text-white">
                        {currency}{event.price || 0}
                      </span>
                      <span className="text-[10px] font-black uppercase text-blue-600 tracking-tighter group-hover:translate-x-1 transition-transform">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Bookings View */
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Upcoming */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Upcoming Events</h2>
              <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                {upcomingBookings.length}
              </span>
            </div>

            {upcomingBookings.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-700">
                <Ticket className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400 font-medium italic">No upcoming bookings. Start exploring!</p>
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
              <h2 className="text-2xl font-bold text-gray-400 dark:text-gray-600 tracking-tight">Past Experiences</h2>
            </div>
            {pastBookings.length === 0 ? (
              <p className="text-gray-400 italic text-sm font-medium">No past bookings found.</p>
            ) : (
              <div className="grid gap-6 opacity-75 grayscale hover:grayscale-0 transition-all duration-500">
                {pastBookings.map((booking) => (
                  <BookingCard key={booking._id} booking={booking} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

const BookingCard = ({ booking }) => {
  const { backendUrl, currency } = useContext(AppContent);
  const [showMap, setShowMap] = useState(false);
  const { eventId, tickets, totalAmount } = booking;
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
