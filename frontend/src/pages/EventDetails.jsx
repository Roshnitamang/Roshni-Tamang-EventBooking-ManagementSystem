import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import MapComponent from '../components/MapComponent';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { backendUrl, isLoggedin } = useContext(AppContent);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/events/${id}`);
                if (data.success) {
                    setEvent(data.event);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error("Failed to load event");
            }
        };
        fetchEvent();
    }, [id, backendUrl]);

    if (!event) return <div className="p-20 text-center font-bold text-gray-400">Loading experience...</div>;

    const startDate = new Date(event.date);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            <div className="w-full h-[400px] relative overflow-hidden bg-black flex items-center justify-center">
                {event.image ? (
                    <img src={event.image.startsWith('/uploads') ? backendUrl + event.image : event.image} alt={event.title} className="w-full h-full object-cover blur-2xl opacity-40 scale-110" />
                ) : null}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="relative z-20 max-w-5xl w-full px-6 flex justify-center">
                    <div className="w-full max-w-4xl aspect-[16/9] shadow-2xl rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {event.image ? (
                            <img src={event.image.startsWith('/uploads') ? backendUrl + event.image : event.image} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                    {/* LEFT COLUMN: Info */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="space-y-4">
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                                {startDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-[1.1]">
                                {event.title}
                            </h1>
                        </div>

                        {event.summary && (
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border-l-4 border-blue-600">
                                <p className="text-lg font-bold text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                    "{event.summary}"
                                </p>
                            </div>
                        )}

                        <div className="space-y-6">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">About this event</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line text-[17px]">
                                {event.description}
                            </p>
                        </div>

                        {/* HIGHLIGHTS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase text-gray-400 tracking-tighter">Doors Open</p>
                                    <p className="font-bold text-gray-900 dark:text-white">{event.highlights?.doorTime || 'Time not specified'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase text-gray-400 tracking-tighter">Entry info</p>
                                    <p className="font-bold text-gray-900 dark:text-white">{event.highlights?.ageRestriction || 'All ages welcome'}</p>
                                </div>
                            </div>
                        </div>

                        {/* LOCATION WITH MAP */}
                        {event.location && (
                            <div className="space-y-6 pt-12 border-t border-gray-100 dark:border-gray-800">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Location</h3>
                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="font-semibold">{event.location}</span>
                                </div>

                                {/* Google Map */}
                                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <MapComponent
                                        latitude={event.coordinates?.latitude}
                                        longitude={event.coordinates?.longitude}
                                        height="300px"
                                    />
                                </div>
                            </div>
                        )}

                        {/* FAQs */}
                        {event.faqs && event.faqs.length > 0 && (
                            <div className="space-y-8 pt-12 border-t border-gray-100 dark:border-gray-800">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Frequently Asked Questions</h3>
                                <div className="space-y-4">
                                    {event.faqs.map((faq, i) => (
                                        <div key={i} className="group border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                            <h4 className="font-bold text-gray-900 dark:text-white mb-2 italic">Q: {faq.question}</h4>
                                            <p className="text-gray-500 text-sm leading-relaxed">{faq.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Sticky Sidebar */}
                    <div className="relative">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white dark:bg-[#1a1a1c] border border-gray-100 dark:border-gray-800 rounded-2xl p-8 shadow-xl shadow-gray-200/40 dark:shadow-none">
                                <div className="flex justify-between items-end mb-8">
                                    <div>
                                        <p className="text-xs font-black uppercase text-gray-400 mb-1">Price from</p>
                                        <p className="text-3xl font-black text-gray-900 dark:text-white">
                                            {event.price > 0 ? `$${event.price}` : 'Free'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black uppercase text-blue-600 mb-1">Tickets</p>
                                        <p className="font-bold text-gray-900 dark:text-white">{event.ticketsAvailable} left</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/checkout/${id}`)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                                >
                                    Reserve a spot
                                </button>

                                <div className="mt-8 space-y-4 pt-8 border-t border-gray-50 dark:border-gray-800">
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <span className="font-bold">{event.location}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className="font-bold">Starts at {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-center text-xs font-bold text-gray-400 p-4 leading-relaxed">
                                By booking you agree to our terms of service and the event organizer's policies.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EventDetails;
