import { useEffect, useState, useContext, useRef } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { AppContent } from '../context/AppContext'
import OpenSourceMap from '../components/OpenSourceMap'
import CommunityChat from '../components/CommunityChat'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Calendar, Ticket, ChevronDown, ChevronUp, CreditCard, Sparkles, Download, X, Search, Filter, ArrowRight, Rocket, MessageSquare } from 'lucide-react'

const AttendeeDashboard = () => {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'bookings', or 'community'
  const { backendUrl, userData, currency, locationSearch, setLocationSearch } = useContext(AppContent);
  const categoryRef = useRef(null);
  
  const categories = [
    "Music", "Nightlife", "Health", "Holidays", "Hobbies", "Business", "Food"
  ];

  const dailyMessages = [
    "Seize the day and build experiences that will define your future.",
    "Your journey to extraordinary moments begins with a single bold step.",
    "Find your next event and join the community.",
    "You're all set to explore.",
    "enjoy the best moments life has to offer."
  ];

  const getDailyMessage = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    return dailyMessages[dayOfYear % dailyMessages.length];
  };

  const [dailyQuote] = useState(getDailyMessage());

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
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Removed: Auto-set location search from user profile
  /*
  useEffect(() => {
    if (!locationSearch && userData?.location) {
        setLocationSearch(userData.location);
    }
  }, [userData]);
  */

  useEffect(() => {
    fetchEvents();
    fetchBookings();
  }, [backendUrl, search, category, locationSearch]);

  const upcomingBookings = bookings.filter(b => b.eventId && new Date(b.eventId.date) >= new Date());

  return (
    <div className="min-h-screen bg-transparent py-20 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className={`flex flex-col md:flex-row justify-between items-end gap-8 hidden-print border-b border-zinc-100 dark:border-zinc-900 pb-12 transition-all duration-500 ${activeTab === 'community' ? 'mb-8' : 'mb-16'}`}>
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20 rotate-3">
                  <Sparkles className="text-white w-6 h-6" />
               </div>
               <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                  Welcome, <span className="text-emerald-500">{userData?.name?.split(' ')[0] || 'Guest'}</span>
               </h1>
            </div>
            <p className="text-zinc-500 font-bold text-lg max-w-xl italic">
               "{dailyQuote}"
            </p>
          </div>

          <div className="flex p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-2xl">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-8 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === 'browse' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40' : 'text-zinc-500 hover:text-emerald-400'}`}
            >
              Browse Events
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-8 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === 'bookings' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40' : 'text-zinc-500 hover:text-emerald-400'}`}
            >
              My Tickets
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === 'community' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40' : 'text-zinc-500 hover:text-emerald-400'}`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Community
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'browse' ? (
            <motion.div 
               key="browse"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="space-y-16 hidden-print"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-[2] relative group">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] px-14 py-6 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 shadow-xl"
                  />
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                
                <div className="flex-1 relative group">
                  <input
                    type="text"
                    placeholder="Location..."
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] px-14 py-6 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 shadow-xl"
                  />
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>

                <div className="relative w-full md:w-72" ref={categoryRef}>
                  <button
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="w-full h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] px-8 py-6 flex items-center justify-between shadow-xl group hover:border-emerald-500 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Filter className={`w-4 h-4 ${category ? 'text-emerald-500' : 'text-zinc-400'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300">
                        {category || 'All Categories'}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180 text-emerald-500' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isCategoryOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden z-[60]"
                      >
                        <div className="py-2">
                          <button
                            onClick={() => { setCategory(''); setIsCategoryOpen(false); }}
                            className={`w-full text-left px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${!category ? 'bg-zinc-100 dark:bg-zinc-800 text-emerald-500' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-emerald-500'}`}
                          >
                            All Categories
                          </button>
                          {categories.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => { setCategory(cat); setIsCategoryOpen(false); }}
                              className={`w-full text-left px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${category === cat ? 'bg-zinc-100 dark:bg-zinc-800 text-emerald-500' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-emerald-500'}`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {events.length === 0 ? (
                  <div className="col-span-full py-32 text-center bg-white dark:bg-zinc-900/50 rounded-[3rem] border-2 border-dashed border-zinc-800">
                    <Rocket className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
                    <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-sm">No events found matching your search</p>
                  </div>
                ) : (
                  events.map((event) => (
                    <Link
                      key={event._id}
                      to={`/event/${event._id}`}
                      className="group bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl hover:border-emerald-500/30 hover:-translate-y-2 transition-all duration-500"
                    >
                      <div className="aspect-[16/10] overflow-hidden relative">
                        <img
                          src={event.image && event.image.startsWith('/uploads') ? backendUrl + event.image : event.image}
                          alt={event.title}
                          className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-4 py-1.5 bg-black/80 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 border border-zinc-200 dark:border-white/5">
                            {event.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-8">
                        <div className="flex items-center gap-2 mb-3">
                           <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                           <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <h3 className="font-black text-xl mb-4 line-clamp-1 text-zinc-900 dark:text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{event.title}</h3>
                        
                        <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800/50">
                          <div className="flex flex-col">
                            <span className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none">
                              {currency}{event.price || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500 tracking-widest group-hover:gap-4 transition-all">
                            Details <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          ) : activeTab === 'bookings' ? (
            <motion.div 
               key="bookings"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="space-y-16"
            >
              <section className="hidden-print">
                <div className="flex items-center gap-4 mb-10">
                   <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <Ticket className="w-6 h-6 text-emerald-500" />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">My Upcoming Events</h2>
                      <div className="flex items-center gap-2 mt-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                         <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{upcomingBookings.length} Booked Events</p>
                      </div>
                   </div>
                </div>

                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-24 bg-white dark:bg-zinc-900/30 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800">
                    <Ticket className="w-12 h-12 text-zinc-800 mx-auto mb-6" />
                    <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-sm">No upcoming bookings found</p>
                  </div>
                ) : (
                  <div className="grid gap-8">
                    {upcomingBookings.map((booking) => (
                      <BookingCard key={booking._id} booking={booking} />
                    ))}
                  </div>
                )}
              </section>
            </motion.div>
          ) : (
            <motion.div
               key="community"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center gap-4 mb-8">
                 <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <MessageSquare className="w-6 h-6 text-emerald-500" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">Community</h2>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Real-time Discussion</p>
                 </div>
              </div>
              <CommunityChat events={events} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const BookingCard = ({ booking }) => {
  const { backendUrl, currency } = useContext(AppContent);
  const [showMap, setShowMap] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const { eventId, tickets, totalAmount, _id, bookingType } = booking;
  if (!eventId) return null;

  const handlePrint = () => {
    window.print();
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${_id}&color=10b981`;

  return (
    <>
      <div className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl hover:border-emerald-500/20 transition-all duration-500 hidden-print">
        <div className="p-8 flex flex-col lg:flex-row gap-10 items-center">
          <div className="w-full lg:w-56 aspect-square relative rounded-[2rem] overflow-hidden shadow-2xl flex-shrink-0 group-hover:scale-105 transition-transform duration-700">
            <img
              src={eventId.image && eventId.image.startsWith('/uploads') ? backendUrl + eventId.image : eventId.image}
              alt={eventId.title}
              className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
            />
            {booking.paymentStatus !== 'completed' && (
                <div className="absolute inset-0 bg-red-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400 rotate-[-15deg] border border-red-500/30 px-3 py-1 bg-red-950/80 rounded-lg">
                        Processing
                    </span>
                </div>
            )}
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
               <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">{eventId.category}</span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-200 dark:border-zinc-800/50">
              <div>
                <h3 className="font-black text-3xl text-zinc-900 dark:text-white tracking-tighter uppercase mb-2">{eventId.title}</h3>
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Booking ID: {_id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowTicket(true)} 
                  className="btn-primary !py-3.5 !px-8 shadow-emerald-900/20"
                >
                  View Ticket
                </button>
                <Link to={`/event/${eventId._id}`} className="px-8 py-3.5 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-[2rem] text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-widest hover:border-emerald-500 transition-all">
                  View Event
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-500">
                   <Calendar className="w-3.5 h-3.5" />
                   <p className="text-[9px] font-black uppercase tracking-[0.3em]">Event Date</p>
                </div>
                <p className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">{new Date(eventId.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              
              <div className="space-y-3">
                 <div className="flex items-center gap-2 text-emerald-500">
                    <Ticket className="w-3.5 h-3.5" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em]">Tickets</p>
                 </div>
                 <p className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">{tickets} Tickets Booked</p>
              </div>

              <div className="space-y-3">
                 <div className="flex items-center gap-2 text-emerald-500">
                    <CreditCard className="w-3.5 h-3.5" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em]">Total Amount</p>
                 </div>
                 <p className="text-lg font-black text-emerald-500 tracking-tighter">{currency}{totalAmount}</p>
              </div>

              <div className="space-y-3">
                 <div className="flex items-center gap-2 text-emerald-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em]">Location</p>
                 </div>
                 <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate max-w-[150px]">{eventId.location}</p>
                    <button
                      onClick={() => setShowMap(!showMap)}
                      className="text-[9px] text-zinc-500 font-black uppercase tracking-widest hover:text-emerald-500 flex items-center gap-2 transition-colors"
                    >
                      {showMap ? <><ChevronUp className="w-3 h-3" /> Hide Map</> : <><ChevronDown className="w-3 h-3" /> Show Map</>}
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {showMap && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zinc-200 dark:border-zinc-800 p-8 bg-transparent/50"
          >
            <div className="rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner">
               <OpenSourceMap
                 latitude={eventId.coordinates?.latitude}
                 longitude={eventId.coordinates?.longitude}
                 address={eventId.location}
                 height="350px"
               />
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showTicket && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   onClick={() => setShowTicket(false)}
                   className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                />
                
                <style>{`
                    @media print {
                        @page { size: auto; margin: 0; }
                        html, body {
                            margin: 0;
                            padding: 0;
                            height: 100%;
                            overflow: hidden;
                        }
                        body * { visibility: hidden; }
                        .hidden-print { display: none !important; }
                        .ticket-node {
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            transform: none !important;
                            width: 100% !important;
                            height: 100% !important;
                            display: flex !important;
                            flex-direction: column !important;
                            align-items: center !important;
                            justify-content: center !important;
                            border: none !important;
                            border-radius: 0 !important;
                            padding: 20px !important;
                            background: white !important;
                            color: black !important;
                            box-sizing: border-box !important;
                            page-break-after: avoid !important;
                            page-break-before: avoid !important;
                            page-break-inside: avoid !important;
                        }
                        .ticket-node * { visibility: visible; }
                    }
                `}</style>
                
                <motion.div 
                   initial={{ scale: 0.9, opacity: 0, y: 30 }}
                   animate={{ scale: 1, opacity: 1, y: 0 }}
                   exit={{ scale: 0.9, opacity: 0, y: 30 }}
                   className="max-w-xl w-full relative z-10"
                >
                    <button onClick={() => setShowTicket(false)} className="absolute -top-16 right-0 w-12 h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center text-zinc-900 dark:text-white hover:bg-emerald-600 transition-all hidden-print shadow-2xl">
                        <X className="w-6 h-6" />
                    </button>
                    
                    <div className="bg-white dark:bg-zinc-900 rounded-[4rem] p-12 shadow-[0_30px_100px_rgba(0,0,0,0.8)] border border-zinc-200 dark:border-white/5 text-center relative overflow-hidden flex flex-col items-center ticket-node">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-bl-[8rem] blur-3xl hidden-print" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-tr-[10rem] blur-3xl hidden-print" />

                        <div className="flex items-center gap-3 text-emerald-500 mb-8 relative z-10 scale-110">
                            <Sparkles className="w-8 h-8 rotate-12" />
                            <span className="text-3xl font-black tracking-tighter uppercase italic">Planora</span>
                        </div>

                        <div className="w-24 h-24 bg-transparent border border-emerald-500/20 rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl relative z-10 rotate-3 group-hover:rotate-0 transition-transform">
                            <Ticket className="w-12 h-12 text-emerald-500" />
                        </div>

                        <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter text-zinc-900 dark:text-white relative z-10 leading-none">Your Ticket</h2>
                        <div className="flex items-center gap-2 mb-10 relative z-10">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                           <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em]">Your ticket is confirmed</p>
                        </div>

                        <div className="w-full text-left bg-transparent p-10 rounded-[3rem] space-y-8 relative z-10 border border-zinc-200 dark:border-zinc-800 shadow-inner">
                            <div className="text-center pb-8 border-b border-zinc-900">
                                <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase leading-none">{eventId?.title}</h3>
                            </div>

                            <div className="space-y-6">
                              <div className="flex justify-between items-center">
                             <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Booking ID</span>
                                <span className="font-mono font-black text-emerald-500 text-lg tracking-widest bg-emerald-500/5 px-4 py-1.5 rounded-xl border border-emerald-500/10">{_id?.slice(-8).toUpperCase()}</span>
                              </div>
                            <div className="flex justify-between items-center">
                                   <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Ticket Details</span>
                                   <span className="font-black text-zinc-900 dark:text-white text-lg uppercase">{tickets}x {bookingType} Tickets</span>
                              </div>
                            <div className="flex justify-between items-center pt-6 border-t border-zinc-900">
                                 <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Amount Paid</span>
                                  <span className="font-black text-emerald-500 text-3xl tracking-tighter">{currency}{totalAmount}</span>
                              </div>
                            </div>
                        </div>
                        
                        <div className="mt-10 mb-6 flex flex-col items-center justify-center relative z-10 w-full group/qr">
                            <div className="p-4 bg-white rounded-3xl shadow-2xl transform group-hover/qr:scale-110 transition-transform duration-500">
                                <img src={qrUrl} alt="Secure QR" className="w-32 h-32" />
                            </div>
                             <p className="mt-6 text-[9px] font-black text-zinc-600 uppercase tracking-[0.5em]">Show this at the event</p>
                        </div>

                        <div className="w-full mt-10 space-y-4 relative z-10">
                          <button onClick={handlePrint} className="w-full bg-emerald-600 text-zinc-900 dark:text-white py-6 rounded-[2.5rem] font-black flex items-center justify-center gap-4 hover:bg-emerald-500 transition-all shadow-2xl active:scale-95 uppercase tracking-[0.3em] text-[10px] hidden-print">
                             <Download className="w-5 h-5" /> Download Ticket
                        </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AttendeeDashboard;
