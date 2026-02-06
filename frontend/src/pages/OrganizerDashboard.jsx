import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContent } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'

const OrganizerDashboard = () => {
    const { backendUrl, userData } = useContext(AppContent)
    const navigate = useNavigate()

    // Step Management
    const [activeStep, setActiveStep] = useState('build') // build, tickets, publish, list

    // Event Data State
    const [eventData, setEventData] = useState({
        title: '',
        summary: '',
        description: '',
        date: '',
        location: '',
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
    })
    const [imageFile, setImageFile] = useState(null)

    const [loading, setLoading] = useState(false)
    const [events, setEvents] = useState([])
    const [stats, setStats] = useState(null)

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

    const handleCreateEvent = async () => {
        try {
            setLoading(true)

            const formData = new FormData()
            // Append all eventData fields to formData
            Object.keys(eventData).forEach(key => {
                if (key === 'highlights' || key === 'faqs') {
                    formData.append(key, JSON.stringify(eventData[key]))
                } else if (key === 'image' && imageFile) {
                    // Skip 'image' URL if we have a file
                } else {
                    formData.append(key, eventData[key])
                }
            })

            // Append the image file if it exists
            if (imageFile) {
                formData.append('image', imageFile)
            }

            const { data } = await axios.post(backendUrl + '/api/events/create',
                formData,
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            )

            if (data.success) {
                toast.success('Event launched successfully!')
                setActiveStep('list')
                setEventData({
                    title: '', summary: '', description: '', date: '', location: '',
                    category: 'Music', image: '', price: '', ticketsAvailable: '100',
                    highlights: { ageRestriction: 'All ages allowed', doorTime: '', parking: 'Free parking' },
                    faqs: []
                })
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

    // UI Helpers
    const StepLink = ({ id, label, icon }) => (
        <button
            onClick={() => setActiveStep(id)}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${activeStep === id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
        >
            <span className="text-xl">{icon}</span>
            <span className="font-semibold text-sm">{label}</span>
        </button>
    )

    return (
        <div className="bg-white dark:bg-gray-950 min-h-screen text-gray-900 dark:text-gray-100">
            <div className="max-w-7xl mx-auto px-6 py-10">

                <div className="flex flex-col md:flex-row gap-10">

                    {/* Sidebar Nav */}
                    <div className="md:w-64 space-y-2">
                        <div className="mb-8 px-4">
                            <h1 className="text-2xl font-black tracking-tight text-blue-600">Planora Studio</h1>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Organizer Workspace</p>
                        </div>

                        <StepLink id="list" label="My Events" icon="📊" />
                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-4 mx-4"></div>
                        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Create Event</p>
                        <StepLink id="build" label="1. Build" icon="🏗️" />
                        <StepLink id="tickets" label="2. Tickets" icon="🎫" />
                        <StepLink id="publish" label="3. Publish" icon="🚀" />
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
                                            { label: 'Active Events', value: stats?.totalEvents || 0, icon: '📅' },
                                            { label: 'Tickets Sold', value: stats?.totalTicketsSold || 0, icon: '🎫' },
                                            { label: 'Revenue', value: `$${stats?.totalRevenue || 0}`, icon: '💰' }
                                        ].map((s, i) => (
                                            <div key={i} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                                                        <h3 className="text-2xl font-black">{s.value}</h3>
                                                    </div>
                                                    <span className="text-2xl">{s.icon}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        {events.length === 0 ? (
                                            <div className="py-20 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
                                                <p className="text-gray-400">No events yet. Ready to launch something epic?</p>
                                                <button
                                                    onClick={() => setActiveStep('build')}
                                                    className="mt-4 text-blue-600 font-bold hover:underline"
                                                >
                                                    Start Building →
                                                </button>
                                            </div>
                                        ) : (
                                            events.map(event => (
                                                <div key={event._id} className="group bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all flex flex-col md:flex-row gap-6 items-center">
                                                    <div className="w-full md:w-32 h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
                                                        {event.image && <img src={event.image.startsWith('/uploads') ? backendUrl + event.image : event.image} className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-0.5 rounded italic">
                                                                {event.category}
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                {new Date(event.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        </div>
                                                        <h4 className="text-lg font-bold group-hover:text-blue-600 transition">{event.title}</h4>
                                                        <p className="text-sm text-gray-400">📍 {event.location} • {event.ticketsAvailable} Capacity</p>
                                                    </div>
                                                    <div className="flex gap-2 w-full md:w-auto">
                                                        <button
                                                            onClick={() => navigate(`/manage-bookings/${event._id}`)}
                                                            className="flex-1 md:flex-none px-5 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-bold rounded-xl transition"
                                                        >
                                                            Insights
                                                        </button>
                                                        <button
                                                            onClick={() => deleteEvent(event._id)}
                                                            className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
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
                                            className="relative group overflow-hidden bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-800 aspect-video flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-all"
                                            onClick={() => document.getElementById('imageInput').click()}
                                        >
                                            {eventData.image ? (
                                                <img src={eventData.image} className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <span className="text-4xl mb-4">🖼️</span>
                                                    <p className="font-bold text-gray-400">Click to upload Image or Paste URL below</p>
                                                    <p className="text-[10px] text-gray-300 uppercase font-black mt-2">Recommended: 16:9 Aspect Ratio</p>
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
                                                className="absolute bottom-6 mx-10 left-0 right-0 py-3 px-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl border-none shadow-2xl text-sm outline-none focus:ring-2 ring-blue-500"
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
                                                    className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full text-xs"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid gap-6">
                                            <div className="relative border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-6 focus-within:border-blue-500 transition-all">
                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest absolute top-4 left-6">Event Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Neon Nights Summer Jam"
                                                    className="w-full mt-4 bg-transparent text-xl font-bold outline-none"
                                                    value={eventData.title}
                                                    onChange={e => setEventData({ ...eventData, title: e.target.value })}
                                                />
                                            </div>

                                            <div className="relative border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-6 focus-within:border-blue-500 transition-all">
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
                                                <div className="relative border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-6 focus-within:border-blue-500 transition-all">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Category</label>
                                                    <select
                                                        className="w-full bg-transparent font-bold outline-none cursor-pointer"
                                                        value={eventData.category}
                                                        onChange={e => setEventData({ ...eventData, category: e.target.value })}
                                                    >
                                                        <option>Music</option>
                                                        <option>Technology</option>
                                                        <option>Workshop</option>
                                                        <option>Business</option>
                                                    </select>
                                                </div>
                                                <div className="relative border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-6 focus-within:border-blue-500 transition-all">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Date & Time</label>
                                                    <input
                                                        type="datetime-local"
                                                        className="w-full bg-transparent font-bold outline-none"
                                                        value={eventData.date}
                                                        onChange={e => setEventData({ ...eventData, date: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="relative border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-6 focus-within:border-blue-500 transition-all">
                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest absolute top-4 left-6">Location</label>
                                                <input
                                                    type="text"
                                                    placeholder="Search for a venue or address..."
                                                    className="w-full mt-4 bg-transparent font-bold outline-none"
                                                    value={eventData.location}
                                                    onChange={e => setEventData({ ...eventData, location: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setActiveStep('tickets')}
                                            className="w-full py-5 bg-black dark:bg-white dark:text-black text-white rounded-3xl font-black text-lg hover:bg-gray-900 transition-all flex items-center justify-center gap-3"
                                        >
                                            Next: Add Tickets 🎫
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
                                        <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/40">
                                            <div className="flex gap-10">
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest block mb-1">Base Price</label>
                                                    <div className="flex items-center">
                                                        <span className="text-4xl font-black text-blue-600 mr-2">$</span>
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

                                        <div className="relative border-2 border-gray-100 dark:border-gray-800 rounded-3xl p-8">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-4">Venue Capacity</label>
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
                                                className="py-5 bg-gray-100 dark:bg-gray-900 rounded-3xl font-bold transition-all"
                                            >
                                                Back to Build
                                            </button>
                                            <button
                                                onClick={() => setActiveStep('publish')}
                                                className="py-5 bg-black dark:bg-white dark:text-black text-white rounded-3xl font-black hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
                                            >
                                                Final Steps: Publish 🚀
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

                                    <div className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 p-8 rounded-[2.5rem] space-y-8">
                                        <div>
                                            <h3 className="text-lg font-bold mb-4">Highlights</h3>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Age Restriction</label>
                                                    <select
                                                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl outline-none font-bold"
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
                                                        className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl outline-none font-bold"
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
                                                    className="text-blue-600 text-sm font-bold hover:underline"
                                                >
                                                    + Add Question
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {eventData.faqs.map((faq, index) => (
                                                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl relative">
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
                                                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Full Description</label>

                                            <textarea
                                                rows="5"
                                                className="w-full bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl outline-none font-medium text-sm leading-relaxed"
                                                placeholder="Write a compelling story about your event..."
                                                value={eventData.description}
                                                onChange={e => setEventData({ ...eventData, description: e.target.value })}
                                            />
                                        </div>

                                        <button
                                            onClick={handleCreateEvent}
                                            disabled={loading}
                                            className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl hover:scale-[1.02] transition-all shadow-xl shadow-blue-500/30 disabled:opacity-50"
                                        >
                                            {loading ? 'Launching Epicness...' : '🚀 Launch Event Now'}
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => setActiveStep('tickets')}
                                        className="text-gray-400 font-bold hover:text-gray-600"
                                    >
                                        ← Back to Tickets
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
