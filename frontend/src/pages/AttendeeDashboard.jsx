import { useEffect, useState, useContext, useRef } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { AppContent } from '../context/AppContext'
import OpenSourceMap from '../components/OpenSourceMap'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Calendar, Ticket, ChevronDown, ChevronUp, CreditCard, Sparkles, Download, X, Search, Filter, ArrowRight, Rocket, Clock } from 'lucide-react'

const AttendeeDashboard = () => {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'bookings'
  const { backendUrl, userData, currency, locationSearch } = useContext(AppContent);
  
  const dailyMessages = [
    "Seize the day and build experiences that will define your future.",
    "Your journey to extraordinary moments begins with a single bold step.",
    "Excellence is a habit. Welcome to your command center for elite exploration.",
    "The future belongs to the prepared. Let's discover your next horizon.",
    "Energy and persistence conquer all obstacles. Your elite access is ready.",
    "Success is where preparation meets opportunity. You are in the right place.",
    "Dream big, act decisively, and savor the finest moments life has to offer."
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
    fetchEvents();
    fetchBookings();
  }, [backendUrl, search, category, locationSearch]);

  const upcomingBookings = bookings.filter(b => b.eventId && new Date(b.eventId.date) >= new Date());
  const pastBookings = bookings.filter(b => b.eventId && new Date(b.eventId.date) < new Date());

  return (
    <div className="min-h-screen bg-transparent py-20 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 hidden-print border-b border-zinc-100 dark:border-zinc-900 pb-12">
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

          {/* Tab Switcher */}
          <div className="flex p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-2xl">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-8 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === 'browse' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40' : 'text-zinc-500 hover:text-emerald-400'}`}
            >
              Browse Inventory
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-8 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === 'bookings' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40' : 'text-zinc-500 hover:text-emerald-400'}`}
            >
              Access Tokens
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
               className="space-y-12 hidden-print"
            >
              {/* Search/Filter Bar */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 relative group">
                  <input
                    type="text"
                    placeholder="Search global experiences..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] px-12 py-5 outline-none focus:border-emerald-500 transition-all font-bold text-zinc-900 dark:text-white placeholder:text-zinc-700"
                  />
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <div className="relative group">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="appearance-none px-12 py-5 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-emerald-500 transition-all font-black text-[10px] uppercase tracking-widest text-zinc-600 dark:text-zinc-300 w-full md:w-64 cursor-pointer"
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
                  <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-hover:text-emerald-500 transition-colors pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {events.length === 0 ? (
                  <div className="col-span-full py-32 text-center bg-white dark:bg-zinc-900/50 rounded-[3rem] border-2 border-dashed border-zinc-900">
                    <Rocket className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
                    <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-sm">No Signal Found Matching Parameters</p>
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
                          <span className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">
                            {currency}{event.price || 0}
                          </span>
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
          ) : (
            /* Bookings View */
            <motion.div 
               key="bookings"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="space-y-16"
            >
              {/* Upcoming */}
              <section className="hidden-print">
                <div className="flex items-center gap-4 mb-10">
                   <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <Ticket className="w-6 h-6 text-emerald-500" />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">Active Access</h2>
                      <div className="flex items-center gap-2 mt-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                         <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{upcomingBookings.length} Secured Experiences</p>
                      </div>
                   </div>
                </div>

                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-24 bg-white dark:bg-zinc-900/30 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800">
                    <Ticket className="w-12 h-12 text-zinc-800 mx-auto mb-6" />
                    <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-sm">No Active Booking Records Detected</p>
                  </div>
                ) : (
                  <div className="grid gap-8">
                    {upcomingBookings.map((booking) => (
                      <BookingCard key={booking._id} booking={booking} />
                    ))}
                  </div>
                )}
              </section>

              {/* Past */}
              <section className="hidden-print">
                <div className="flex items-center gap-4 mb-10 opacity-50">
                   <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <Clock className="w-6 h-6 text-zinc-500" />
                   </div>
                   <h2 className="text-2xl font-black text-zinc-500 tracking-tighter uppercase">Historical Archive</h2>
                </div>
                {pastBookings.length === 0 ? (
                  <p className="text-zinc-700 font-black uppercase tracking-[0.4em] text-[10px] italic">No Archived Experience Data</p>
                ) : (
                  <div className="grid gap-8 opacity-40 grayscale-[80%] hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                    {pastBookings.map((booking) => (
                      <BookingCard key={booking._id} booking={booking} />
                    ))}
                  </div>
                )}
              </section>
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
          {/* Event Poster */}
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
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Confidential Reference: {_id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowTicket(true)} 
                  className="btn-primary !py-3.5 !px-8 shadow-emerald-900/20"
                >
                  Retrieve Ticket
                </button>
                <Link to={`/event/${eventId._id}`} className="px-8 py-3.5 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-[2rem] text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-widest hover:border-emerald-500 transition-all">
                  Event Brief
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-500">
                   <Calendar className="w-3.5 h-3.5" />
                   <p className="text-[9px] font-black uppercase tracking-[0.3em]">Protocol Date</p>
                </div>
                <p className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">{new Date(eventId.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              
              <div className="space-y-3">
                 <div className="flex items-center gap-2 text-emerald-500">
                    <Ticket className="w-3.5 h-3.5" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em]">Allocation</p>
                 </div>
                 <p className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">{tickets} Reserved Units</p>
              </div>

              <div className="space-y-3">
                 <div className="flex items-center gap-2 text-emerald-500">
                    <CreditCard className="w-3.5 h-3.5" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em]">Capital Vol.</p>
                 </div>
                 <p className="text-lg font-black text-emerald-500 tracking-tighter">{currency}{totalAmount}</p>
              </div>

              <div className="space-y-3">
                 <div className="flex items-center gap-2 text-emerald-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em]">Coordinate</p>
                 </div>
                 <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate max-w-[150px]">{eventId.location}</p>
                    <button
                      onClick={() => setShowMap(!showMap)}
                      className="text-[9px] text-zinc-500 font-black uppercase tracking-widest hover:text-emerald-500 flex items-center gap-2 transition-colors"
                    >
                      {showMap ? <><ChevronUp className="w-3 h-3" /> Hide Logic</> : <><ChevronDown className="w-3 h-3" /> Map Overlay</>}
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

      {/* TICKET MODAL - Premium Glass-Morphism */}
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
                        body * { visibility: hidden; }
                        .ticket-node, .ticket-node * { visibility: visible; }
                        .hidden-print { display: none !important; }
                        .ticket-node {
                            position: absolute; left: 50%; top: 50%;
                            transform: translate(-50%, -50%);
                            width: 100%; max-width: 450px;
                            border: 3px solid #000 !important;
                            border-radius: 40px !important;
                            padding: 40px !important;
                            background: white !important;
                            color: black !important;
                        }
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

                        <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter text-zinc-900 dark:text-white relative z-10 leading-none">Access Token</h2>
                        <div className="flex items-center gap-2 mb-10 relative z-10">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                           <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em]">Global Clearance SECURED</p>
                        </div>

                        <div className="w-full text-left bg-transparent p-10 rounded-[3rem] space-y-8 relative z-10 border border-zinc-200 dark:border-zinc-800 shadow-inner">
                            <div className="text-center pb-8 border-b border-zinc-900">
                                <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase leading-none">{eventId?.title}</h3>
                            </div>

                            <div className="space-y-6">
                               <div className="flex justify-between items-center">
                                   <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Registry Identifier</span>
                                   <span className="font-mono font-black text-emerald-500 text-lg tracking-widest bg-emerald-500/5 px-4 py-1.5 rounded-xl border border-emerald-500/10">{_id?.slice(-8).toUpperCase()}</span>
                               </div>
                               <div className="flex justify-between items-center">
                                   <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Seat Allocation</span>
                                   <span className="font-black text-zinc-900 dark:text-white text-lg uppercase">{tickets}x {bookingType} Units</span>
                               </div>
                               <div className="flex justify-between items-center pt-6 border-t border-zinc-900">
                                   <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Yield Value</span>
                                   <span className="font-black text-emerald-500 text-3xl tracking-tighter">{currency}{totalAmount}</span>
                               </div>
                            </div>
                        </div>
                        
                        {/* QR Code */}
                        <div className="mt-10 mb-6 flex flex-col items-center justify-center relative z-10 w-full group/qr">
                            <div className="p-4 bg-white rounded-3xl shadow-2xl transform group-hover/qr:scale-110 transition-transform duration-500">
                                <img src={qrUrl} alt="Secure QR" className="w-32 h-32" />
                            </div>
                            <p className="mt-6 text-[9px] font-black text-zinc-600 uppercase tracking-[0.5em]">Present for Extraction</p>
                        </div>

                        <div className="w-full mt-10 space-y-4 relative z-10">
                           <button onClick={handlePrint} className="w-full bg-emerald-600 text-zinc-900 dark:text-white py-6 rounded-[2.5rem] font-black flex items-center justify-center gap-4 hover:bg-emerald-500 transition-all shadow-2xl active:scale-95 uppercase tracking-[0.3em] text-[10px] hidden-print">
                               <Download className="w-5 h-5" /> Download Archive
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

