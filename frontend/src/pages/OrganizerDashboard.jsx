import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContent } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import LeafletLocationPicker from '../components/LeafletLocationPicker'
import {
    LayoutDashboard,
    Hammer,
    Ticket,
    Rocket,
    Calendar,
    DollarSign,
    ImagePlus,
    Trash2,
    MapPin,
    Clock,
    Users,
    TrendingUp,
    ChevronRight,
    Sparkles,
    Plus,
    X,
    Edit2,
    ArrowLeft
} from 'lucide-react'

const OrganizerDashboard = () => {
    const context = useContext(AppContent);
    const { backendUrl, userData, currency } = context || {};
    const navigate = useNavigate();

    // Step Management
    const [activeStep, setActiveStep] = useState('list'); // build, tickets, publish, list, insights

    // Event Data State
    const [eventData, setEventData] = useState({
        title: '',
        summary: '',
        description: '',
        date: '',
        location: '',
        coordinates: { latitude: null, longitude: null },
        category: 'Music',
        image: '',
        price: '',
        ticketsAvailable: '100',
        highlights: {
            ageRestriction: 'All ages allowed',
            doorTime: '',
            parking: 'Free parking'
        },
        faqs: [],
        dynamicPricing: {
            enabled: false,
            minPrice: '',
            maxPrice: ''
        }
    });
    const [imageFile, setImageFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState(null);

    const fetchData = async () => {
        try {
            const eventsRes = await axios.get(backendUrl + '/api/events/my-events', { withCredentials: true })
            if (eventsRes.data.success) setEvents(eventsRes.data.events)

            const statsRes = await axios.get(backendUrl + '/api/organizer/stats', { withCredentials: true })
            if (statsRes.data.success) setStats(statsRes.data.stats)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchData()
    }, [backendUrl])

    const handleSubmitEvent = async () => {
        try {
            setLoading(true)

            const formData = new FormData()
            Object.keys(eventData).forEach(key => {
                if (key === 'highlights' || key === 'faqs' || key === 'ticketTypes' || key === 'coordinates' || key === 'dynamicPricing') {
                    formData.append(key, JSON.stringify(eventData[key]))
                } else if (key === 'image' && imageFile) {
                    // Skip
                } else {
                    formData.append(key, eventData[key])
                }
            })

            if (imageFile) {
                formData.append('image', imageFile)
            }

            const { data } = await axios.post(`${backendUrl}/api/events/create`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            if (data.success) {
                toast.success('Event launched successfully!')
                setActiveStep('list')
                resetForm()
                fetchData()
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setEventData({
            title: '', summary: '', description: '', date: '', location: '',
            coordinates: { latitude: null, longitude: null },
            category: 'Music', image: '', price: '', ticketsAvailable: '100',
            highlights: { ageRestriction: 'All ages allowed', doorTime: '', parking: 'Free parking' },
            faqs: [],
            dynamicPricing: { enabled: false, minPrice: '', maxPrice: '' }
        })
        setImageFile(null)
    }

    const deleteEvent = async (id) => {
        if (!confirm('Are you sure you want to delete this event?')) return
        try {
            const { data } = await axios.delete(`${backendUrl}/api/events/${id}`, { withCredentials: true })
            if (data.success) {
                toast.success('Event deleted')
                fetchData()
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Insights State
    const [selectedEventId, setSelectedEventId] = useState(null)
    const [eventBookings, setEventBookings] = useState([])
    const [viewingEventStats, setViewingEventStats] = useState(null)

    const fetchEventDetails = async (id) => {
        try {
            setLoading(true)
            setSelectedEventId(id)
            const { data } = await axios.get(`${backendUrl}/api/organizer/event-bookings/${id}`, { withCredentials: true })
            if (data.success) {
                setEventBookings(data.bookings)
                const totalRevenue = data.bookings.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0)
                const ticketsSold = data.bookings.reduce((acc, curr) => acc + (curr.tickets || 0), 0)
                setViewingEventStats({
                    revenue: totalRevenue,
                    ticketsSold: ticketsSold,
                    recentBookings: data.bookings.slice(0, 5)
                })
                setActiveStep('insights')
            }
        } catch (error) {
            toast.error("Failed to load event details")
        } finally {
            setLoading(false)
        }
    }

    // UI Helpers
    const StepLink = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveStep(id)}
            className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all duration-300 group ${activeStep === id
                ? 'bg-emerald-600 text-zinc-900 dark:text-white shadow-xl shadow-emerald-900/40 translate-x-1'
                : 'text-zinc-500 hover:bg-white dark:bg-zinc-900 hover:text-emerald-400'
                }`}
        >
            <div className={`p-2 rounded-xl transition-all duration-300 ${activeStep === id
                ? 'bg-white/20'
                : 'bg-zinc-800/50 group-hover:bg-emerald-500/10'
                }`}>
                <Icon className={`w-5 h-5 transition-transform duration-300 ${activeStep === id ? 'scale-110' : 'group-hover:scale-110'}`} />
            </div>
            <span className="font-black text-xs uppercase tracking-widest">{label}</span>
            {activeStep === id && <ChevronRight className="w-4 h-4 ml-auto" />}
        </button>
    )

    return (
        <div className="bg-transparent min-h-screen text-zinc-900 dark:text-zinc-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Sidebar Nav */}
                    <aside className="lg:w-72 space-y-2 shrink-0">
                        <div className="mb-12 px-5">
                            <div className="flex items-center gap-3 mb-4 group cursor-pointer" onClick={() => setActiveStep('list')}>
                                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-900/20">
                                    <Sparkles className="w-6 h-6 text-zinc-900 dark:text-white" />
                                </div>
                                <h1 className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">Planora <span className="text-emerald-500">Studio</span></h1>
                            </div>
                            <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                               <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500">Organizer Dashboard</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <StepLink id="list" label="My Events" icon={LayoutDashboard} />
                        </div>
                        
                        <div className="pt-10 pb-4">
                            <h3 className="px-5 text-[9px] font-black text-zinc-600 uppercase mb-4 tracking-[0.3em]">Event Management</h3>
                            <div className="space-y-1">
                                <StepLink id="build" label="Create Event" icon={Hammer} />
                                <StepLink id="tickets" label="build" icon={Ticket} />
                                <StepLink id="publish" label="publish" icon={Rocket} />
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            {/* LIST VIEW */}
                            {activeStep === 'list' && (
                                <motion.div
                                    key="list"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-12"
                                >
                                    <header>
                                        <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4 leading-none uppercase">Dashboard</h2>
                                        <p className="text-zinc-500 font-medium text-lg">Manage your events and track performance.</p>
                                    </header>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        {[
                                            { label: 'Total Events', value: stats?.totalEvents || 0, icon: Calendar, color: 'emerald' },
                                            { label: 'Tickets Sold', value: stats?.totalTicketsSold || 0, icon: Ticket, color: 'emerald' },
                                            { label: 'Revenue', value: `${currency}${stats?.totalRevenue || 0}`, icon: DollarSign, color: 'emerald' }
                                        ].map((s, i) => (
                                            <div key={i} className="group bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-12 -mt-12"></div>
                                                <div className="relative z-10 flex flex-col gap-6">
                                                    <div className="p-3 rounded-2xl w-fit bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform duration-300">
                                                        <s.icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">{s.label}</p>
                                                        <h3 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">{s.value}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-6">
                                        {events.length === 0 ? (
                                            <div className="py-24 text-center border-2 border-dashed border-zinc-900 rounded-[3rem] bg-white dark:bg-zinc-900/20 group">
                                                <Rocket className="w-16 h-16 mx-auto mb-6 text-zinc-800 group-hover:text-emerald-500 transition-colors group-hover:-translate-y-2 duration-700" />
                                                <p className="text-zinc-500 font-black uppercase tracking-[0.3em] mb-8 text-sm">No events found</p>
                                                <button
                                                    onClick={() => setActiveStep('build')}
                                                    className="btn-primary flex items-center gap-3 mx-auto shadow-2xl shadow-emerald-900/40"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                    Initialize Event
                                                </button>
                                            </div>
                                        ) : (
                                            events.map(event => (
                                                <div key={event._id} className="group bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/30 transition-all duration-300 flex flex-col md:flex-row gap-8 items-center">
                                                    <div className="w-full md:w-48 aspect-[16/10] bg-transparent rounded-2xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800 relative shadow-2xl">
                                                        {event.image ? (
                                                           <img src={event.image.startsWith('/uploads') ? backendUrl + event.image : event.image} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700" />
                                                        ) : (
                                                           <div className="w-full h-full flex items-center justify-center text-zinc-800"><Calendar className="w-10 h-10" /></div>
                                                        )}
                                                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                                           <div className="text-[8px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full w-fit backdrop-blur-md">
                                                              {event.category}
                                                           </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                                                            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                                                                Event Date: {new Date(event.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                        <h4 className="text-2xl font-black text-zinc-900 dark:text-white group-hover:text-emerald-400 transition-colors duration-300 uppercase tracking-tight truncate leading-none mb-6">{event.title}</h4>
                                                        <div className="flex flex-wrap items-center gap-6 text-[11px] text-zinc-500 font-bold uppercase tracking-widest">
                                                            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" /> {event.location}</span>
                                                            <span className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-500" /> {event.ticketsAvailable} Capacity</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex md:flex-col gap-3 w-full md:w-auto shrink-0">
                                                        <button
                                                            onClick={() => fetchEventDetails(event._id)}
                                                            className="px-8 py-3.5 bg-transparent hover:bg-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white rounded-2xl transition-all border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-3 shadow-lg"
                                                        >
                                                            <TrendingUp className="w-4 h-4" />
                                                            Overview
                                                        </button>
                                                        <button
                                                            onClick={() => deleteEvent(event._id)}
                                                            className="p-3.5 text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-zinc-900 dark:text-white border border-red-500/10 rounded-2xl transition-all shadow-lg"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* INSIGHTS VIEW */}
                            {activeStep === 'insights' && (
                                <motion.div
                                    key="insights"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center gap-8 border-b border-zinc-900 pb-12">
                                        <button
                                            onClick={() => setActiveStep('list')}
                                            className="w-14 h-14 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-all shadow-xl"
                                        >
                                            <ArrowLeft className="w-6 h-6 text-zinc-900 dark:text-white" />
                                        </button>
                                        <div>
                                            <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none mb-4 uppercase">Event Overview</h2>
                                            <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em]">{events.find(e => e._id === selectedEventId)?.title}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Revenue</p>
                                            <h3 className="text-4xl font-black text-emerald-500 tracking-tighter">{currency}{viewingEventStats?.revenue || 0}</h3>
                                        </div>
                                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Tickets Sold</p>
                                            <h3 className="text-4xl font-black text-teal-500 tracking-tighter">{viewingEventStats?.ticketsSold || 0}</h3>
                                        </div>
                                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Available Tickets</p>
                                            <h3 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
                                                {events.find(e => e._id === selectedEventId)?.ticketsAvailable - (viewingEventStats?.ticketsSold || 0)}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl">
                                        <div className="p-10 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-transparent/20">
                                            <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-widest hover:text-emerald-400 transition-colors">Booking List</h3>
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-transparent/50 text-[10px] uppercase font-black text-zinc-600 tracking-[0.3em]">
                                                    <tr>
                                                        <th className="py-6 px-10">User Name</th>
                                                        <th className="py-6 px-10 text-center">Tickets Booked</th>
                                                        <th className="py-6 px-10 text-center">Amount Paid</th>
                                                        <th className="py-6 px-10 text-right">Booking Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-800/50">
                                                    {eventBookings.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="4" className="py-24 text-center text-zinc-700 font-black uppercase tracking-[0.4em] text-sm">No Booking Data Available</td>
                                                        </tr>
                                                    ) : (
                                                        eventBookings.map(booking => (
                                                            <tr key={booking._id} className="hover:bg-transparent/30 transition-colors group">
                                                                <td className="py-6 px-10">
                                                                    <p className="font-black text-zinc-900 dark:text-white group-hover:text-emerald-400 Transition-colors uppercase tracking-tight">{booking.userId?.name || 'Anonymous User'}</p>
                                                                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{booking.userId?.email}</p>
                                                                </td>
                                                                <td className="py-6 px-10 text-center font-black text-zinc-500 dark:text-zinc-400">{booking.tickets} Units</td>
                                                                <td className="py-6 px-10 text-center font-black text-emerald-500">{currency}{booking.totalAmount}</td>
                                                                <td className="py-6 px-10 text-right text-zinc-700 font-black text-[10px] uppercase tracking-widest">{new Date(booking.createdAt).toLocaleDateString()}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* BUILD STEP */}
                            {activeStep === 'build' && (
                                <motion.div
                                    key="build"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="max-w-3xl space-y-12"
                                >
                                    <header>
                                        <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4 leading-none uppercase">Create Event</h2>
                                        <p className="text-zinc-500 font-medium text-lg">Set the basic details for your event.</p>
                                    </header>

                                    <div className="space-y-10">
                                        {/* Image Upload Placeholder */}
                                        <div
                                            className="relative group overflow-hidden bg-white dark:bg-zinc-900 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 aspect-video flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-all duration-500 shadow-2xl"
                                            onClick={() => document.getElementById('imageInput').click()}
                                        >
                                            {eventData.image ? (
                                                <img src={eventData.image.startsWith('/uploads') ? backendUrl + eventData.image : eventData.image} className="absolute inset-0 w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000" />
                                            ) : (
                                                <>
                                                    <div className="p-6 bg-zinc-800 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                                                        <ImagePlus className="w-12 h-12 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                                                    </div>
                                                    <p className="font-black text-zinc-600 uppercase tracking-widest text-xs group-hover:text-zinc-500 dark:text-zinc-400 transition-colors">Select Event Image</p>
                                                    <p className="text-[9px] text-zinc-700 uppercase font-black mt-2 tracking-[0.2em]">Format: 16:9 Optimized</p>
                                                </>
                                            )}
                                            <input
                                                id="imageInput"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={e => {
                                                    const file = e.target.files[0]
                                                    if (file) {
                                                        setImageFile(file)
                                                        setEventData({ ...eventData, image: URL.createObjectURL(file) })
                                                    }
                                                }}
                                            />
                                            {imageFile && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setImageFile(null)
                                                        setEventData({ ...eventData, image: '' })
                                                    }}
                                                    className="absolute top-6 right-6 bg-red-600 hover:bg-red-500 text-zinc-900 dark:text-white p-3 rounded-2xl transition-all shadow-xl active:scale-90"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid gap-8">
                                            <div className="relative bg-white dark:bg-zinc-900 rounded-[2rem] p-8 border border-zinc-200 dark:border-zinc-800 focus-within:border-emerald-500 group transition-all duration-300">
                                                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] block mb-4 group-focus-within:text-emerald-500 transition-colors">Event Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="EVENT NAME..."
                                                    className="w-full bg-transparent text-2xl font-black outline-none placeholder:text-zinc-800 text-zinc-900 dark:text-white uppercase tracking-tight"
                                                    value={eventData.title}
                                                    onChange={e => setEventData({ ...eventData, title: e.target.value })}
                                                />
                                            </div>

                                            <div className="relative bg-white dark:bg-zinc-900 rounded-[2rem] p-8 border border-zinc-200 dark:border-zinc-800 focus-within:border-emerald-500 group transition-all duration-300">
                                                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] block mb-4 group-focus-within:text-emerald-500 transition-colors">Brief Summary</label>
                                                <input
                                                    type="text"
                                                    placeholder="Short summary of the event..."
                                                    className="w-full bg-transparent font-bold text-zinc-600 dark:text-zinc-300 outline-none placeholder:text-zinc-800"
                                                    value={eventData.summary}
                                                    onChange={e => setEventData({ ...eventData, summary: e.target.value })}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 border border-zinc-200 dark:border-zinc-800 focus-within:border-emerald-500 group transition-all duration-300">
                                                    <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] block mb-4 group-focus-within:text-emerald-500 transition-colors">Category</label>
                                                    <select
                                                        className="w-full bg-transparent font-black text-zinc-900 dark:text-zinc-100 outline-none cursor-pointer uppercase tracking-widest text-sm"
                                                        value={eventData.category}
                                                        onChange={e => setEventData({ ...eventData, category: e.target.value })}
                                                    >
                                                        <option className="bg-transparent">Music</option>
                                                        <option className="bg-transparent">Nightlife</option>
                                                        <option className="bg-transparent">Health</option>
                                                        <option className="bg-transparent">Holidays</option>
                                                        <option className="bg-transparent">Hobbies</option>
                                                        <option className="bg-transparent">Business</option>
                                                        <option className="bg-transparent">Food</option>
                                                    </select>
                                                </div>
                                                <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 border border-zinc-200 dark:border-zinc-800 focus-within:border-emerald-500 group transition-all duration-300">
                                                    <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] block mb-4 group-focus-within:text-emerald-500 transition-colors">Date & Time</label>
                                                    <input
                                                        type="datetime-local"
                                                        className="w-full bg-transparent font-black text-zinc-900 dark:text-zinc-100 outline-none uppercase tracking-widest text-sm"
                                                        value={eventData.date}
                                                        onChange={e => setEventData({ ...eventData, date: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="relative bg-white dark:bg-zinc-900 rounded-[2rem] p-8 border border-zinc-200 dark:border-zinc-800 focus-within:border-emerald-500 group transition-all duration-300">
                                                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] block mb-4 group-focus-within:text-emerald-500 transition-colors">Event Location</label>
                                                <div className="relative">
                                                   <input
                                                       type="text"
                                                       placeholder="EVENT LOCATION OR ADDRESS..."
                                                       className="w-full bg-transparent font-black text-zinc-900 dark:text-white outline-none placeholder:text-zinc-800 uppercase tracking-tight"
                                                       value={eventData.location}
                                                       onChange={e => setEventData({ ...eventData, location: e.target.value })}
                                                   />
                                                   <MapPin className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-800 group-focus-within:text-emerald-500 transition-colors" />
                                                </div>
                                            </div>

                                            {/* Map Location Picker */}
                                            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-4 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl">
                                                <div className="p-6">
                                                   <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.4em] block mb-4">Event Location (Map)</label>
                                                </div>
                                                <LeafletLocationPicker
                                                    initialLat={eventData.coordinates?.latitude}
                                                    initialLng={eventData.coordinates?.longitude}
                                                    onLocationSelect={(coords) => {
                                                        setEventData(prev => ({ ...prev, coordinates: coords }))
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setActiveStep('tickets')}
                                            className="w-full py-6 bg-emerald-600 text-zinc-900 dark:text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-sm hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-900/30 flex items-center justify-center gap-4 active:scale-95"
                                        >
                                            Next: Pricing & Tickets
                                            <Ticket className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* TICKETS STEP */}
                            {activeStep === 'tickets' && (
                                <motion.div
                                    key="tickets"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="max-w-xl space-y-12"
                                >
                                    <header>
                                        <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4 leading-none uppercase">build</h2>
                                        <p className="text-zinc-500 font-medium text-lg">Set the price and number of tickets.</p>
                                    </header>

                                    <div className="space-y-10">
                                        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-12 rounded-[3.5rem] text-zinc-900 dark:text-white shadow-2xl shadow-emerald-900/40 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[60px] -mr-24 -mt-24 group-hover:scale-125 transition-transform duration-1000"></div>
                                            
                                            <div className="relative z-10">
                                                <label className="text-[10px] font-black uppercase text-emerald-200 tracking-[0.4em] block mb-6 flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4" />
                                                    Ticket Price
                                                </label>
                                                <div className="flex items-center">
                                                    <span className="text-5xl font-black text-zinc-900 dark:text-white mr-4 opacity-50">{currency}</span>
                                                    <input
                                                        type="number"
                                                        placeholder="0.00"
                                                        className="w-full bg-transparent text-7xl font-black text-zinc-900 dark:text-white outline-none placeholder:text-zinc-900 dark:text-white/20 tracking-tighter"
                                                        value={eventData.price}
                                                        onChange={e => setEventData({ ...eventData, price: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-10 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/30 transition-all shadow-2xl">
                                            <div className="flex justify-between items-center mb-8">
                                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em] flex items-center gap-3">
                                                    <Users className="w-4 h-4 text-emerald-500" />
                                                    Total Tickets
                                                </label>
                                                <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">{eventData.ticketsAvailable}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="5000"
                                                className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                                                value={eventData.ticketsAvailable}
                                                onChange={e => setEventData({ ...eventData, ticketsAvailable: e.target.value })}
                                            />
                                            <div className="mt-8 flex items-center gap-3 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                                <Sparkles className="w-4 h-4 text-emerald-500" />
                                                <p className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest">Set the number of tickets available for this event.</p>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-10 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/30 transition-all shadow-2xl">
                                            <div className="flex justify-between items-center mb-8">
                                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em] flex items-center gap-3">
                                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                                    Dynamic Pricing
                                                </label>
                                                <button
                                                    onClick={() => setEventData({
                                                        ...eventData,
                                                        dynamicPricing: { ...eventData.dynamicPricing, enabled: !eventData.dynamicPricing.enabled }
                                                    })}
                                                    className={`w-14 h-8 rounded-full transition-all duration-300 relative ${eventData.dynamicPricing.enabled ? 'bg-emerald-600' : 'bg-zinc-800'}`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 ${eventData.dynamicPricing.enabled ? 'left-7' : 'left-1'}`}></div>
                                                </button>
                                            </div>
                                            
                                            <AnimatePresence>
                                                {eventData.dynamicPricing.enabled && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="space-y-6 overflow-hidden"
                                                    >
                                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                                                            AI will automatically adjust prices based on demand velocity and time remaining. 
                                                            Set your floor and ceiling values.
                                                        </p>
                                                        <div className="grid grid-cols-2 gap-6 pt-4">
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Min Price ({currency})</label>
                                                                <input
                                                                    type="number"
                                                                    placeholder="Floor"
                                                                    className="w-full bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl outline-none text-sm font-black text-zinc-900 dark:text-white"
                                                                    value={eventData.dynamicPricing.minPrice}
                                                                    onChange={e => setEventData({
                                                                        ...eventData,
                                                                        dynamicPricing: { ...eventData.dynamicPricing, minPrice: e.target.value }
                                                                    })}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Max Price ({currency})</label>
                                                                <input
                                                                    type="number"
                                                                    placeholder="Ceiling"
                                                                    className="w-full bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl outline-none text-sm font-black text-zinc-900 dark:text-white"
                                                                    value={eventData.dynamicPricing.maxPrice}
                                                                    onChange={e => setEventData({
                                                                        ...eventData,
                                                                        dynamicPricing: { ...eventData.dynamicPricing, maxPrice: e.target.value }
                                                                    })}
                                                                />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>


                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setActiveStep('build')}
                                                className="py-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-white hover:bg-zinc-800 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] transition-all"
                                            >
                                                Back to Basics
                                            </button>
                                            <button
                                                onClick={() => setActiveStep('publish')}
                                                className="py-6 bg-emerald-600 text-zinc-900 dark:text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] hover:bg-emerald-500 transition-all shadow-2xl active:scale-95"
                                            >
                                                Next: Details
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* PUBLISH STEP */}
                            {activeStep === 'publish' && (
                                <motion.div
                                    key="publish"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="max-w-3xl space-y-12"
                                >
                                    <header>
                                        <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4 leading-none uppercase">publish</h2>
                                        <p className="text-zinc-500 font-medium text-lg">Add additional details and publishing options.</p>
                                    </header>

                                    <div className="space-y-10">
                                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-10 rounded-[3rem] space-y-12 shadow-2xl">
                                            <section>
                                                <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.4em] mb-8 border-l-4 border-emerald-500 pl-4">Event Highlights</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-3">
                                                        <label className="text-[9px] font-black uppercase text-zinc-600 tracking-[0.2em] ml-2">Age Restriction</label>
                                                        <select
                                                            className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl outline-none font-black uppercase tracking-widest text-[10px] text-zinc-600 dark:text-zinc-300 hover:border-emerald-500 transition-all"
                                                            value={eventData.highlights.ageRestriction}
                                                            onChange={e => setEventData({ ...eventData, highlights: { ...eventData.highlights, ageRestriction: e.target.value } })}
                                                        >
                                                            <option className="bg-transparent">All ages allowed</option>
                                                            <option className="bg-transparent">18+</option>
                                                            <option className="bg-transparent">21+ Restricted</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[9px] font-black uppercase text-zinc-600 tracking-[0.2em] ml-2">Parking</label>
                                                        <select
                                                            className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl outline-none font-black uppercase tracking-widest text-[10px] text-zinc-600 dark:text-zinc-300 hover:border-emerald-500 transition-all"
                                                            value={eventData.highlights.parking}
                                                            onChange={e => setEventData({ ...eventData, highlights: { ...eventData.highlights, parking: e.target.value } })}
                                                        >
                                                            <option className="bg-transparent">Free logistics</option>
                                                            <option className="bg-transparent">Premium logistics</option>
                                                            <option className="bg-transparent">Valet Support</option>
                                                            <option className="bg-transparent">No Parking</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </section>

                                            <section>
                                                <div className="flex justify-between items-center mb-8">
                                                    <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em] border-l-4 border-zinc-200 dark:border-zinc-800 pl-4">Frequently Asked Questions</h3>
                                                    <button
                                                        onClick={() => setEventData({
                                                            ...eventData,
                                                            faqs: [...eventData.faqs, { question: '', answer: '' }]
                                                        })}
                                                        className="flex items-center gap-2 text-emerald-500 text-[9px] font-black uppercase tracking-widest hover:text-emerald-400 p-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10 transition-all"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Add Entry
                                                    </button>
                                                </div>
                                                <div className="space-y-4">
                                                    {eventData.faqs.map((faq, index) => (
                                                        <div key={index} className="bg-transparent p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 relative group/faq hover:border-emerald-500/30 transition-all">
                                                            <input
                                                                placeholder="Question..."
                                                                className="w-full bg-transparent font-black text-zinc-900 dark:text-white mb-3 outline-none uppercase tracking-tight text-sm placeholder:text-zinc-800"
                                                                value={faq.question}
                                                                onChange={e => {
                                                                    const newFaqs = [...eventData.faqs];
                                                                    newFaqs[index].question = e.target.value;
                                                                    setEventData({ ...eventData, faqs: newFaqs });
                                                                }}
                                                            />
                                                            <textarea
                                                                placeholder="Answer..."
                                                                className="w-full bg-transparent text-xs font-medium text-zinc-500 outline-none placeholder:text-zinc-800 leading-relaxed"
                                                                rows="3"
                                                                value={faq.answer}
                                                                onChange={e => {
                                                                    const newFaqs = [...eventData.faqs];
                                                                    newFaqs[index].answer = e.target.value;
                                                                    setEventData({ ...eventData, faqs: newFaqs });
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newFaqs = eventData.faqs.filter((_, i) => i !== index);
                                                                    setEventData({ ...eventData, faqs: newFaqs });
                                                                }}
                                                                className="absolute top-6 right-6 text-zinc-800 hover:text-red-500 transition-all active:scale-90"
                                                            >
                                                                <X className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>

                                            <section>
                                                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.4em] block mb-6 border-l-4 border-zinc-200 dark:border-zinc-800 pl-4">Detailed Description</label>
                                                <textarea
                                                    rows="8"
                                                    className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2.5rem] outline-none font-medium text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 focus:border-emerald-500 transition-all placeholder:text-zinc-800"
                                                    placeholder="Synthesize the primary narrative of this experience..."
                                                    value={eventData.description}
                                                    onChange={e => setEventData({ ...eventData, description: e.target.value })}
                                                />
                                            </section>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <button 
                                                onClick={() => setActiveStep('tickets')}
                                                className="py-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] hover:text-zinc-900 dark:text-white transition-all"
                                            >
                                                Adjust Inventory
                                            </button>
                                        <button
                                                onClick={handleSubmitEvent}
                                                disabled={loading}
                                                className="py-6 bg-emerald-600 text-zinc-900 dark:text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-[12px] hover:bg-emerald-500 transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                                            >
                                                {loading ? 'Initializing...' : (
                                                    <>
                                                        Launch Experience
                                                        <Rocket className="w-5 h-5 shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    )
}

export default OrganizerDashboard;

