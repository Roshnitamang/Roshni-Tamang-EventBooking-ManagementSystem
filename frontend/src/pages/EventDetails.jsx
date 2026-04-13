import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import OpenSourceMap from '../components/OpenSourceMap';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { backendUrl, isLoggedin, currency } = useContext(AppContent);
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

    if (!event) return (
        <div className="min-h-screen bg-transparent flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const startDate = new Date(event.date);

    return (
        <div className="min-h-screen bg-transparent pt-20">

            {/* Hero Image Section */}
            <div className="max-w-7xl mx-auto px-6 mb-12">
                <div className="w-full h-[400px] relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/50 shadow-2xl">
                    {event.image ? (
                        <img
                            src={event.image.startsWith('/uploads') ? backendUrl + event.image : event.image}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                             <Palette className="w-20 h-20 text-zinc-700" />
                        </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                    {/* LEFT COLUMN: Info */}
                    <div className="lg:col-span-2 space-y-16">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                               <span className="h-0.5 w-8 bg-emerald-500"></span>
                               <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em]">
                                   {startDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                               </p>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white tracking-tighter leading-[0.95]">
                                {event.title}
                            </h1>
                        </div>

                        {event.summary && (
                            <div className="bg-white dark:bg-zinc-900/50 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800/50 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600"></div>
                                <p className="text-xl font-bold text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
                                    "{event.summary}"
                                </p>
                            </div>
                        )}

                        <div className="space-y-8">
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase tracking-widest text-[10px] text-zinc-500 opacity-50">Discovery / About</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-line text-lg">
                                {event.description}
                            </p>
                        </div>

                        {/* HIGHLIGHTS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-zinc-200 dark:border-zinc-800/50">
                            <div className="flex items-start gap-5">
                                <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div className="mt-1">
                                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Schedule / Doors</p>
                                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{event.highlights?.doorTime || 'Time not specified'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-5">
                                <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div className="mt-1">
                                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Policy / Access</p>
                                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{event.highlights?.ageRestriction || 'All ages welcome'}</p>
                                </div>
                            </div>
                        </div>

                        {/* LOCATION WITH MAP */}
                        {event.location && (
                            <div className="space-y-8 pt-12 border-t border-zinc-200 dark:border-zinc-800/50">
                                <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase tracking-widest text-[10px] text-zinc-500 opacity-50">Mapping / Venue</h3>
                                <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-300">
                                    <div className="w-10 h-10 rounded-full bg-emerald-600/10 flex items-center justify-center">
                                       <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                       </svg>
                                    </div>
                                    <span className="text-xl font-bold tracking-tight">{event.location}</span>
                                </div>

                                {/* Open Source Map */}
                                <div className="rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl scale-[0.99] hover:scale-100 transition-transform duration-700">
                                    <OpenSourceMap
                                        latitude={event.coordinates?.latitude}
                                        longitude={event.coordinates?.longitude}
                                        address={event.location}
                                        height="450px"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Sticky Sidebar */}
                    <div className="relative">
                        <div className="sticky top-28 space-y-8">
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                                
                                <div className="flex justify-between items-end mb-10">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2">Investment</p>
                                        <p className="text-4xl font-black text-zinc-900 dark:text-white">
                                            {event.price > 0 ? `${currency}${event.price}` : 'Free'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-2">
                                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                           <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Limited</span>
                                        </div>
                                        <p className="font-bold text-zinc-500 dark:text-zinc-400 text-sm">{event.ticketsAvailable} left</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/checkout/${id}`)}
                                    disabled={event.ticketsAvailable === 0 || new Date(event.date) < new Date().setHours(0, 0, 0, 0)}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-zinc-900 dark:text-white py-5 rounded-xl font-black uppercase tracking-widest transition-all shadow-2xl shadow-emerald-900/40 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {event.ticketsAvailable === 0 ? 'Fully Booked' : (new Date(event.date) < new Date().setHours(0, 0, 0, 0) ? 'Event Passed' : 'Reserve experience')}
                                </button>

                                <div className="mt-10 space-y-6 pt-10 border-t border-zinc-200 dark:border-zinc-800/50">
                                    <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 group/item">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center group-hover/item:text-emerald-500 transition-colors">
                                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </div>
                                        <span className="font-bold tracking-tight">{event.location}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 group/item">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center group-hover/item:text-emerald-500 transition-colors">
                                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <span className="font-bold tracking-tight">Access at {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-white dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 text-center">
                               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                                   Encrypted Checkout / Verified Organizer
                               </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EventDetails;

