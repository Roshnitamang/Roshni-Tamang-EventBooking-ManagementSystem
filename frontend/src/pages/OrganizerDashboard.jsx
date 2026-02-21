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
    Edit2
} from 'lucide-react'

const OrganizerDashboard = () => {
    const context = useContext(AppContent);
    const { backendUrl, userData, currency } = context || {};
    const navigate = useNavigate();

    console.log("OrganizerDashboard rendering, userData:", userData);

    // Step Management
    const [activeStep, setActiveStep] = useState('build'); // build, tickets, publish, list

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
        faqs: []
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
            // Append all eventData fields to formData
            Object.keys(eventData).forEach(key => {
                if (key === 'highlights' || key === 'faqs' || key === 'ticketTypes' || key === 'coordinates') {
                    formData.append(key, JSON.stringify(eventData[key]))
                } else if (key === 'image' && imageFile) {
                    // Skip 'image' URL if we have a file - it will be appended separately
                } else {
                    formData.append(key, eventData[key])
                }
            })

            // Append the image file if it exists
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
            faqs: []
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

    // --- Automatic Geocoding Logic ---
    useEffect(() => {
        if (!eventData.location || eventData.location.trim().length < 3) return;

        const delayDebounceFn = setTimeout(async () => {
            try {
                console.log("Fetching coordinates for:", eventData.location);
                const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                    params: {
                        q: eventData.location,
                        format: 'json',
                        limit: 1
                    },
                    headers: {
                        'User-Agent': 'Planora-Event-Booking-App'
                    }
                });

                if (response.data && response.data.length > 0) {
                    const { lat, lon } = response.data[0];
                    setEventData(prev => {
                        const { latitude, longitude } = newCoords;
                        if (prev.coordinates?.latitude === latitude && prev.coordinates?.longitude === longitude) {
                            return prev;
                        }
                        console.log("Geocoding success, updating coords:", { latitude, longitude });
                        return { ...prev, coordinates: { latitude, longitude } };
                    });
                } else {
                    console.log("No geocoding results for:", eventData.location);
                }
            } catch (error) {
                console.error("Geocoding error:", error);
            }
        }, 1000); // 1s debounce

        return () => clearTimeout(delayDebounceFn);
    }, [eventData.location]);

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

                // Calculate specific stats for this event
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
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 group ${activeStep === id
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
        >
            <div className={`p-2 rounded-lg transition-all duration-300 ${activeStep === id
                ? 'bg-white/20'
                : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20'
                }`}>
                <Icon className={`w-5 h-5 transition-transform duration-300 ${activeStep === id ? 'scale-110' : 'group-hover:scale-110'}`} />
            </div>
            <span className="font-semibold text-sm">{label}</span>
            {activeStep === id && <ChevronRight className="w-4 h-4 ml-auto" />}
        </button>
    )

    return (
        <div className="bg-white dark:bg-gray-950 min-h-screen text-gray-900 dark:text-gray-100">
            <div className="max-w-7xl mx-auto px-6 py-10">

                <div className="flex flex-col md:flex-row gap-10">

                    {/* Sidebar Nav */}
                    <div className="md:w-64 space-y-2">
                        <div className="mb-8 px-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-6 h-6 text-blue-600" />
                                <h1 className="text-2xl font-black tracking-tight text-blue-600">Planora Studio</h1>
                            </div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Organizer Workspace</p>
                        </div>

                        <StepLink id="list" label="My Events" icon={LayoutDashboard} />
                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-4 mx-4"></div>
                        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Create Event</p>
                        <StepLink id="build" label="1. Build" icon={Hammer} />
                        <StepLink id="tickets" label="2. Tickets" icon={Ticket} />
                        <StepLink id="publish" label="3. Publish" icon={Rocket} />
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">

                        <AnimatePresence mode="wait">
                            {/* LIST VIEW */}
                            {activeStep === 'list' && (
                                <motion.div
                                    key="list"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-8"
                                >
                                    <header>
                                        <h2 className="text-3xl font-bold">Event Management</h2>
                                        <p className="text-gray-500 mt-1">Track and manage your scheduled experiences.</p>
                                    </header>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        {[
                                            { label: 'Active Events', value: stats?.totalEvents || 0, icon: Calendar, color: 'blue' },
                                            { label: 'Tickets Sold', value: stats?.totalTicketsSold || 0, icon: Ticket, color: 'purple' },
                                            { label: 'Revenue', value: `${currency}${stats?.totalRevenue || 0}`, icon: DollarSign, color: 'green' }
                                        ].map((s, i) => (
                                            <div key={i} className="group bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-900/30 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{s.label}</p>
                                                        <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{s.value}</h3>
                                                    </div>
                                                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${s.color === 'blue' ? 'from-blue-500 to-blue-600' :
                                                        s.color === 'purple' ? 'from-purple-500 to-purple-600' :
                                                            'from-green-500 to-green-600'
                                                        } shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                        <s.icon className="w-6 h-6 text-white" />
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-gray-500">
                                                    <TrendingUp className="w-3 h-3" />
                                                    <span>View details</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        {events.length === 0 ? (
                                            <div className="py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/50 dark:bg-gray-900/20">
                                                <Rocket className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                                                <p className="text-gray-400 font-semibold mb-4">No events yet. Ready to launch something epic?</p>
                                                <button
                                                    onClick={() => setActiveStep('build')}
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/30"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                    Start Building
                                                </button>
                                            </div>
                                        ) : (
                                            events.map(event => (
                                                <div key={event._id} className="group bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300 flex flex-col md:flex-row gap-6 items-center">
                                                    <div className="w-full md:w-32 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                                        {event.image && <img src={event.image.startsWith('/uploads') ? backendUrl + event.image : event.image} className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-1 rounded-full">
                                                                {event.category}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                                <Calendar className="w-3 h-3" />
                                                                {new Date(event.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        </div>
                                                        <h4 className="text-lg font-bold group-hover:text-blue-600 transition-colors duration-300">{event.title}</h4>
                                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4" />
                                                                {event.location}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Users className="w-4 h-4" />
                                                                {event.ticketsAvailable} capacity
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 w-full md:w-auto">
                                                        <button
                                                            onClick={() => fetchEventDetails(event._id)}
                                                            className="flex-1 md:flex-none px-5 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-bold rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                                                        >
                                                            <TrendingUp className="w-4 h-4" />
                                                            Insights
                                                        </button>

                                                        <button
                                                            onClick={() => deleteEvent(event._id)}
                                                            className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all duration-300 hover:scale-110"
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
                                    className="space-y-8"
                                >
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setActiveStep('list')}
                                            className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-bold"
                                        >
                                            <ChevronRight className="w-5 h-5 rotate-180" />
                                        </button>
                                        <div>
                                            <h2 className="text-3xl font-black tracking-tight">Event Insights</h2>
                                            <p className="text-gray-500">Detailed analytics and booking history.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Revenue</p>
                                            <h3 className="text-4xl font-black text-green-500">{currency}{viewingEventStats?.revenue || 0}</h3>
                                        </div>
                                        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tickets Sold</p>
                                            <h3 className="text-4xl font-black text-blue-500">{viewingEventStats?.ticketsSold || 0}</h3>
                                        </div>
                                        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Remaining</p>
                                            <h3 className="text-4xl font-black text-purple-500">
                                                {events.find(e => e._id === selectedEventId)?.ticketsAvailable - (viewingEventStats?.ticketsSold || 0)}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                                        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                            <h3 className="text-xl font-bold">Booking History</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                                    <tr>
                                                        <th className="py-4 px-6">Customer</th>
                                                        <th className="py-4 px-6">Tickets</th>
                                                        <th className="py-4 px-6">Amount</th>
                                                        <th className="py-4 px-6">Date</th>
                                                        <th className="py-4 px-6">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                    {eventBookings.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="5" className="py-12 text-center text-gray-400 font-medium">No bookings yet for this event.</td>
                                                        </tr>
                                                    ) : (
                                                        eventBookings.map(booking => (
                                                            <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                                <td className="py-4 px-6">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                                            {booking.userId?.name?.charAt(0) || 'U'}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-bold text-sm">{booking.userId?.name || 'Unknown User'}</p>
                                                                            <p className="text-xs text-gray-400">{booking.userId?.email}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="py-4 px-6 text-sm font-bold">{booking.tickets}</td>
                                                                <td className="py-4 px-6 text-sm font-black text-green-500">{currency}{booking.totalAmount}</td>
                                                                <td className="py-4 px-6 text-sm text-gray-500 font-medium">{new Date(booking.createdAt).toLocaleDateString()}</td>
                                                                <td className="py-4 px-6">
                                                                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                                        Confirmed
                                                                    </span>
                                                                </td>
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
                                    className="max-w-3xl space-y-10"
                                >
                                    <header>
                                        <h2 className="text-3xl font-black tracking-tight">Build your event page</h2>
                                        <p className="text-gray-500">First, lets get the basics right. Professional titles and images get more bookings.</p>
                                    </header>

                                    <div className="space-y-8">
                                        {/* Image Upload Placeholder */}
                                        <div
                                            className="relative group overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-[2.5rem] border-2 border-dashed border-gray-300 dark:border-gray-700 aspect-video flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:scale-[1.01]"
                                            onClick={() => document.getElementById('imageInput').click()}
                                        >
                                            {eventData.image ? (
                                                <img src={eventData.image.startsWith('/uploads') ? backendUrl + eventData.image : eventData.image} className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                                        <ImagePlus className="w-12 h-12 text-gray-400" />
                                                    </div>
                                                    <p className="font-bold text-gray-600 dark:text-gray-400">Click to upload Image or Paste URL below</p>
                                                    <p className="text-[10px] text-gray-400 uppercase font-black mt-2">Recommended: 16:9 Aspect Ratio</p>
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
                                            <input
                                                type="text"
                                                placeholder="Or paste image URL here..."
                                                className="absolute bottom-6 mx-10 left-0 right-0 py-3 px-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl border-none shadow-2xl text-sm outline-none focus:ring-2 ring-blue-500 transition-all duration-300"
                                                value={imageFile ? "Image selected from device" : eventData.image}
                                                readOnly={!!imageFile}
                                                onChange={e => setEventData({ ...eventData, image: e.target.value })}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            {imageFile && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setImageFile(null)
                                                        setEventData({ ...eventData, image: '' })
                                                    }}
                                                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full text-xs transition-all duration-300 hover:scale-110 shadow-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid gap-6">
                                            <div className="relative border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-6 focus-within:border-blue-500 focus-within:shadow-lg transition-all duration-300">
                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest absolute top-4 left-6">Event Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Neon Nights Summer Jam"
                                                    className="w-full mt-4 bg-transparent text-xl font-bold outline-none"
                                                    value={eventData.title}
                                                    onChange={e => setEventData({ ...eventData, title: e.target.value })}
                                                />
                                            </div>

                                            <div className="relative border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-6 focus-within:border-blue-500 focus-within:shadow-lg transition-all duration-300">
                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest absolute top-4 left-6">Summary</label>
                                                <input
                                                    type="text"
                                                    placeholder="One sentence that hooks people..."
                                                    className="w-full mt-4 bg-transparent font-medium text-gray-600 dark:text-gray-300 outline-none"
                                                    value={eventData.summary}
                                                    onChange={e => setEventData({ ...eventData, summary: e.target.value })}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="relative border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-6 focus-within:border-blue-500 focus-within:shadow-lg transition-all duration-300">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Category</label>
                                                    <select
                                                        className="w-full bg-transparent font-bold outline-none cursor-pointer"
                                                        value={eventData.category}
                                                        onChange={e => setEventData({ ...eventData, category: e.target.value })}
                                                    >
                                                        <option>Music</option>
                                                        <option>Nightlife</option>
                                                        <option>Health</option>
                                                        <option>Holidays</option>
                                                        <option>Hobbies</option>
                                                        <option>Business</option>
                                                        <option>Food</option>
                                                    </select>
                                                </div>
                                                <div className="relative border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-6 focus-within:border-blue-500 focus-within:shadow-lg transition-all duration-300">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Date & Time</label>
                                                    <input
                                                        type="datetime-local"
                                                        className="w-full bg-transparent font-bold outline-none"
                                                        value={eventData.date}
                                                        onChange={e => setEventData({ ...eventData, date: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="relative border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-6 focus-within:border-blue-500 focus-within:shadow-lg transition-all duration-300">
                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest absolute top-4 left-6">Location</label>
                                                <input
                                                    type="text"
                                                    placeholder="Search for a venue or address..."
                                                    className="w-full mt-4 bg-transparent font-bold outline-none"
                                                    value={eventData.location}
                                                    onChange={e => setEventData({ ...eventData, location: e.target.value })}
                                                />
                                            </div>

                                            {/* Map Location Picker */}
                                            <div className="border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300">
                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-4">Pin Location on Map</label>
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
                                            className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-3xl font-black text-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-blue-500/30 hover:scale-[1.02] hover:shadow-2xl"
                                        >
                                            Next: Add Tickets
                                            <Ticket className="w-6 h-6" />
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
                                    className="max-w-xl space-y-10"
                                >
                                    <header>
                                        <h2 className="text-3xl font-black tracking-tight">Configure Tickets</h2>
                                        <p className="text-gray-500">How much are people paying? How many spots are available?</p>
                                    </header>

                                    <div className="space-y-6">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 p-8 rounded-[2.5rem] border-2 border-blue-200 dark:border-blue-900/40 hover:shadow-xl transition-all duration-300">
                                            <div className="flex gap-10">
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest block mb-1 flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4" />
                                                        Base Price
                                                    </label>
                                                    <div className="flex items-center">
                                                        <span className="text-4xl font-black text-blue-600 mr-2">{currency}</span>
                                                        <input
                                                            type="number"
                                                            placeholder="0.00"
                                                            className="w-full bg-transparent text-5xl font-black text-blue-600 outline-none placeholder:text-blue-200"
                                                            value={eventData.price}
                                                            onChange={e => setEventData({ ...eventData, price: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative border-2 border-gray-100 dark:border-gray-800 rounded-3xl p-8 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-lg transition-all duration-300">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-4 flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                Venue Capacity
                                            </label>
                                            <div className="flex items-center justify-between gap-6">
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="5000"
                                                    className="flex-1 accent-blue-600"
                                                    value={eventData.ticketsAvailable}
                                                    onChange={e => setEventData({ ...eventData, ticketsAvailable: e.target.value })}
                                                />
                                                <span className="text-2xl font-black min-w-[80px] text-right">{eventData.ticketsAvailable}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-4 italic font-medium">Tip: Keeping tickets limited creates demand! 🔥</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setActiveStep('build')}
                                                className="py-5 bg-gray-100 dark:bg-gray-900 rounded-3xl font-bold transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:scale-105"
                                            >
                                                Back to Build
                                            </button>
                                            <button
                                                onClick={() => setActiveStep('publish')}
                                                className="py-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-3xl font-black hover:from-blue-700 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:scale-105"
                                            >
                                                Final Steps
                                                <Rocket className="w-5 h-5" />
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
                                    className="max-w-3xl space-y-10"
                                >
                                    <header>
                                        <h2 className="text-3xl font-black tracking-tight">Ready to launch?</h2>
                                        <p className="text-gray-500">Provide final highlights to improve your organic traffic.</p>
                                    </header>

                                    <div className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 p-8 rounded-[2.5rem] space-y-8 hover:shadow-xl transition-all duration-300">
                                        <div>
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                <Sparkles className="w-5 h-5 text-blue-600" />
                                                Highlights
                                            </h3>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Age Restriction</label>
                                                    <select
                                                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl outline-none font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                                                        value={eventData.highlights.ageRestriction}
                                                        onChange={e => setEventData({ ...eventData, highlights: { ...eventData.highlights, ageRestriction: e.target.value } })}
                                                    >
                                                        <option>All ages allowed</option>
                                                        <option>18+ Events</option>
                                                        <option>21+ Strict</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Parking</label>
                                                    <select
                                                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl outline-none font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                                                        value={eventData.highlights.parking}
                                                        onChange={e => setEventData({ ...eventData, highlights: { ...eventData.highlights, parking: e.target.value } })}
                                                    >
                                                        <option>Free parking</option>
                                                        <option>Paid parking</option>
                                                        <option>Valet Service</option>
                                                        <option>No parking available</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-bold">Frequently Asked Questions</h3>
                                                <button
                                                    onClick={() => setEventData({
                                                        ...eventData,
                                                        faqs: [...eventData.faqs, { question: '', answer: '' }]
                                                    })}
                                                    className="flex items-center gap-2 text-blue-600 text-sm font-bold hover:underline hover:scale-105 transition-all duration-300"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add Question
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {eventData.faqs.map((faq, index) => (
                                                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl relative hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300">
                                                        <input
                                                            placeholder="Question"
                                                            className="w-full bg-transparent font-bold mb-2 outline-none"
                                                            value={faq.question}
                                                            onChange={e => {
                                                                const newFaqs = [...eventData.faqs];
                                                                newFaqs[index].question = e.target.value;
                                                                setEventData({ ...eventData, faqs: newFaqs });
                                                            }}
                                                        />
                                                        <textarea
                                                            placeholder="Answer"
                                                            className="w-full bg-transparent text-sm outline-none"
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
                                                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:scale-110 transition-all duration-300"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Full Description</label>

                                            <textarea
                                                rows="5"
                                                className="w-full bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl outline-none font-medium text-sm leading-relaxed hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 ring-blue-500 transition-all duration-300"
                                                placeholder="Write a compelling story about your event..."
                                                value={eventData.description}
                                                onChange={e => setEventData({ ...eventData, description: e.target.value })}
                                            />
                                        </div>

                                        <button
                                            onClick={handleSubmitEvent}
                                            disabled={loading}
                                            className="w-full py-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-[2rem] font-black text-xl hover:from-blue-700 hover:to-blue-600 hover:scale-[1.02] transition-all duration-300 shadow-2xl shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Launching Epicness...
                                                </>
                                            ) : (
                                                <>
                                                    <Rocket className="w-6 h-6" />
                                                    Launch Event Now
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => setActiveStep('tickets')}
                                        className="text-gray-400 font-bold hover:text-gray-600 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                                    >
                                        <ChevronRight className="w-4 h-4 rotate-180" />
                                        Back to Tickets
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrganizerDashboard
