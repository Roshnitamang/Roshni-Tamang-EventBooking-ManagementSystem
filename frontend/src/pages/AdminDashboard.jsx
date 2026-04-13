import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    CheckCircle,
    TrendingUp,
    DollarSign,
    Ticket,
    Trash2,
    Briefcase,
    ChevronRight,
    Sparkles,
    BarChart3,
    PieChart as PieIcon,
    LineChart as LineIcon,
    ArrowLeft,
    X,
    User,
    ShieldCheck,
    MapPin,
    Search,
    Filter
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';

const AdminDashboard = () => {
    const { backendUrl, currency } = useContext(AppContent);
    const location = useLocation();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [pendingOrganizers, setPendingOrganizers] = useState([]);
    const [activeStep, setActiveStep] = useState(location.state?.activeStep || 'stats'); // stats, analytics, users, events, organizers, insights
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (location.state?.activeStep) {
            setActiveStep(location.state.activeStep);

            // Clear state and mode after handling to prevent re-triggering
            const newState = { ...location.state };
            delete newState.activeStep;
            window.history.replaceState(newState, document.title);
        }
    }, [location.state]);

    // Insights State
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [eventBookings, setEventBookings] = useState([]);
    const [viewingEventStats, setViewingEventStats] = useState(null);

    // KYC Viewer State
    const [viewingKYC, setViewingKYC] = useState(null);
    const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const statsRes = await axios.get(`${backendUrl}/api/admin/stats`, { withCredentials: true });
            if (statsRes.data.success) setStats(statsRes.data.stats);

            const usersRes = await axios.get(`${backendUrl}/api/admin/users`, { withCredentials: true });
            if (usersRes.data.success) setUsers(usersRes.data.users);

            const eventsRes = await axios.get(`${backendUrl}/api/admin/events`, { withCredentials: true });
            if (eventsRes.data.success) setEvents(eventsRes.data.events);

            const orgsRes = await axios.get(`${backendUrl}/api/admin/organizers/pending`, { withCredentials: true });
            if (orgsRes.data.success) setPendingOrganizers(orgsRes.data.organizers);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [backendUrl]);

    const updateUserRole = async (id, role) => {
        if (!confirm(`Are you sure you want to change this user's role to ${role}?`)) return;
        try {
            const { data } = await axios.put(`${backendUrl}/api/admin/users/${id}/role`, { role }, { withCredentials: true });
            if (data.success) {
                toast.success(data.message);
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update role");
        }
    };

    const deleteUser = async (id) => {
        if (!confirm("Delete this user?")) return;
        try {
            const { data } = await axios.delete(`${backendUrl}/api/admin/users/${id}`, { withCredentials: true });
            if (data.success) {
                toast.success("User deleted");
                fetchData();
            }
        } catch {
            toast.error("Failed to delete user");
        }
    };

    const deleteEvent = async (id) => {
        if (!confirm("Delete this event?")) return;
        try {
            const { data } = await axios.delete(`${backendUrl}/api/admin/events/${id}`, { withCredentials: true });
            if (data.success) {
                toast.success("Event deleted");
                fetchData();
            }
        } catch {
            toast.error("Failed to delete event");
        }
    };

    const approveOrganizer = async (id) => {
        if (!confirm("Approve this organizer request?")) return;
        try {
            const { data } = await axios.put(`${backendUrl}/api/admin/organizers/${id}/approve`, {}, { withCredentials: true });
            if (data.success) {
                toast.success("Organizer approved");
                fetchData();
            }
        } catch {
            toast.error("Failed to approve");
        }
    };

    const rejectOrganizer = async (id) => {
        if (!confirm("Reject this organizer request?")) return;
        try {
            const { data } = await axios.put(`${backendUrl}/api/admin/organizers/${id}/reject`, {}, { withCredentials: true });
            if (data.success) {
                toast.warning("Organizer request rejected");
                fetchData();
            }
        } catch {
            toast.error("Failed to reject");
        }
    };

    const fetchEventInsights = async (id) => {
        try {
            setIsLoading(true);
            setSelectedEventId(id);
            const { data } = await axios.get(`${backendUrl}/api/admin/event-bookings/${id}`, { withCredentials: true });
            if (data.success) {
                setEventBookings(data.bookings);
                const totalRevenue = data.bookings.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
                const ticketsSold = data.bookings.reduce((acc, curr) => acc + (curr.tickets || 0), 0);
                setViewingEventStats({ revenue: totalRevenue, ticketsSold: ticketsSold });
                setActiveStep('insights');
            }
        } catch (error) {
            toast.error("Failed to load insights");
        } finally {
            setIsLoading(false);
        }
    };

    const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

    // UI Helpers
    const NavLink = ({ id, label, icon: Icon, badge }) => (
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
            {badge > 0 && (
                <span className="ml-auto bg-red-500 text-zinc-900 dark:text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">
                    {badge}
                </span>
            )}
            {activeStep === id && !badge && <ChevronRight className="w-4 h-4 ml-auto" />}
        </button>
    );

    return (
        <div className="bg-transparent min-h-screen text-zinc-900 dark:text-zinc-100 font-sans selection:bg-emerald-500/30">
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Sidebar Nav */}
                    <aside className="lg:w-72 space-y-2 shrink-0">
                        <div className="mb-12 px-5">
                            <div className="flex items-center gap-3 mb-4 group cursor-pointer">
                                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-900/20">
                                    <Sparkles className="w-6 h-6 text-zinc-900 dark:text-white" />
                                </div>
                                <h1 className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">PLANORA <span className="text-emerald-500 font-medium">ADMIN</span></h1>
                            </div>
                            <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                               <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500">Live Infrastructure</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <NavLink id="stats" label="Overview" icon={LayoutDashboard} />
                            <NavLink id="analytics" label="Insights" icon={BarChart3} />
                        </div>
                        
                        <div className="pt-10 pb-4">
                            <h3 className="px-5 text-[9px] font-black text-zinc-600 uppercase mb-4 tracking-[0.3em]">Management Console</h3>
                            <div className="space-y-1">
                                <NavLink id="users" label="Operators" icon={Users} />
                                <NavLink id="events" label="Collection" icon={Calendar} />
                                <NavLink id="organizers" label="Proposals" icon={Briefcase} badge={pendingOrganizers.length} />
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            {/* OVERVIEW STEP */}
                            {activeStep === 'stats' && (
                                <motion.div
                                    key="stats"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-12"
                                >
                                    <header>
                                        <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4 leading-none">Global Pulse</h2>
                                        <p className="text-zinc-500 font-medium text-lg">Cross-platform performance and aggregation metrics.</p>
                                    </header>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[
                                            { label: 'Platform Users', value: stats?.totalUsers || 0, icon: Users, color: 'emerald' },
                                            { label: 'Active Events', value: stats?.totalEvents || 0, icon: Calendar, color: 'blue' },
                                            { label: 'Net Revenue', value: `${currency}${stats?.totalRevenue || 0}`, icon: DollarSign, color: 'emerald' },
                                            { label: 'Ticket Volume', value: stats?.totalBookings || 0, icon: Ticket, color: 'purple' }
                                        ].map((s, i) => (
                                            <div key={i} className="group bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-12 -mt-12"></div>
                                                <div className="relative z-10 flex flex-col gap-6">
                                                    <div className={`p-3 rounded-2xl w-fit ${
                                                        s.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        s.color === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                                                        'bg-purple-500/10 text-purple-500'
                                                    } group-hover:scale-110 transition-transform duration-300`}>
                                                        <s.icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">{s.label}</p>
                                                        <h3 className="text-3xl font-black text-zinc-900 dark:text-white">{s.value}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* ANALYTICS STEP */}
                            {activeStep === 'analytics' && (
                                <motion.div
                                    key="analytics"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-12"
                                >
                                    <header>
                                        <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4">Deep Insights</h2>
                                        <p className="text-zinc-500 font-medium text-lg">Visualizing growth and category saturation.</p>
                                    </header>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Revenue Trend */}
                                        <div className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800">
                                            <div className="flex items-center justify-between mb-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                                        <LineIcon className="w-5 h-5 text-emerald-500" />
                                                    </div>
                                                    <h3 className="font-black text-sm uppercase tracking-widest text-zinc-600 dark:text-zinc-300">Revenue Flow</h3>
                                                </div>
                                                <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded">30D TREND</span>
                                            </div>
                                            <div className="h-[300px] min-w-0">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={stats?.revenueTrend}>
                                                        <defs>
                                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
                                                        <XAxis dataKey="date" hide />
                                                        <YAxis hide />
                                                        <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }} />
                                                        <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Category Distribution */}
                                        <div className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800">
                                            <div className="flex items-center gap-3 mb-10">
                                                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                                    <PieIcon className="w-5 h-5 text-blue-500" />
                                                </div>
                                                <h3 className="font-black text-sm uppercase tracking-widest text-zinc-600 dark:text-zinc-300">Category Mix</h3>
                                            </div>
                                            <div className="h-[300px] min-w-0">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={stats?.categoryStats}
                                                            innerRadius={60}
                                                            outerRadius={100}
                                                            paddingAngle={8}
                                                            dataKey="value"
                                                            stroke="none"
                                                        >
                                                            {stats?.categoryStats?.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px' }} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Top Events */}
                                        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800">
                                            <div className="flex items-center gap-3 mb-10">
                                                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                                                    <BarChart3 className="w-5 h-5 text-purple-500" />
                                                </div>
                                                <h3 className="font-black text-sm uppercase tracking-widest text-zinc-600 dark:text-zinc-300">Top Yield Collections</h3>
                                            </div>
                                            <div className="h-[300px] min-w-0">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={stats?.topEvents} layout="vertical" margin={{ left: 40 }}>
                                                        <XAxis type="number" hide />
                                                        <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 10, fontWeight: '900', fill: '#71717a' }} stroke="none" />
                                                        <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px' }} />
                                                        <Bar dataKey="revenue" fill="#10B981" radius={[0, 10, 10, 0]} barSize={24} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* USER DIRECTORY */}
                            {activeStep === 'users' && (
                                <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                        <div>
                                            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4">User Directory</h2>
                                            <p className="text-zinc-500 font-medium text-lg">Manage role assignments and system integrity.</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                            <div className="p-2 transition-colors cursor-pointer hover:bg-zinc-800 rounded-xl"><Search className="w-4 h-4 text-zinc-500" /></div>
                                            <div className="h-4 w-px bg-zinc-800"></div>
                                            <div className="p-2 transition-colors cursor-pointer hover:bg-zinc-800 rounded-xl"><Filter className="w-4 h-4 text-zinc-500" /></div>
                                        </div>
                                    </header>

                                    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-transparent/50 text-[10px] uppercase font-black text-zinc-500 tracking-[0.3em]">
                                                    <tr>
                                                        <th className="py-6 px-10">Personal Profile</th>
                                                        <th className="py-6 px-10 text-center">Authorization</th>
                                                        <th className="py-6 px-10 text-center">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-800/50">
                                                    {users.map(user => (
                                                        <tr key={user._id} className="hover:bg-transparent/30 transition-colors group">
                                                            <td className="py-6 px-10">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-black text-zinc-500 dark:text-zinc-400 group-hover:bg-emerald-500 group-hover:text-zinc-900 dark:text-white transition-all">
                                                                        {user.name[0]}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-zinc-900 dark:text-white text-base group-hover:text-emerald-400 transition-colors">{user.name}</p>
                                                                        <p className="text-xs text-zinc-500 font-medium">{user.email}</p>
                                                                    </div>
                                                                    {user.kycDetails && (
                                                                        <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase rounded border border-emerald-500/20">KYC</div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-6 px-10 text-center">
                                                                <div className="inline-flex items-center gap-3">
                                                                    <select
                                                                        className="bg-transparent border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg outline-none focus:border-emerald-500 transition-all cursor-pointer"
                                                                        value={user.role}
                                                                        onChange={(e) => updateUserRole(user._id, e.target.value)}
                                                                        disabled={user.role === 'super-admin'}
                                                                    >
                                                                        <option value="user">USER</option>
                                                                        <option value="organizer">ORGANIZER</option>
                                                                        <option value="admin">ADMIN</option>
                                                                    </select>
                                                                </div>
                                                            </td>
                                                            <td className="py-6 px-10 text-center">
                                                                <div className="flex justify-center gap-3">
                                                                    {user.kycDetails && (
                                                                        <button
                                                                            onClick={() => { setViewingKYC(user.kycDetails); setIsKYCModalOpen(true); }}
                                                                            className="p-2.5 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500 hover:text-zinc-900 dark:text-white rounded-xl transition-all"
                                                                            title="View KYC Record"
                                                                        >
                                                                            <ShieldCheck className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                    {user.role !== 'super-admin' && (
                                                                        <button onClick={() => deleteUser(user._id)} className="p-2.5 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-zinc-900 dark:text-white rounded-xl transition-all">
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* EVENTS MANAGEMENT */}
                            {activeStep === 'events' && (
                                <motion.div key="events" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                                    <header>
                                        <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4 leading-none">Global Events</h2>
                                        <p className="text-zinc-500 font-medium text-lg">Cross-platform event moderation and audit control.</p>
                                    </header>

                                    <div className="grid grid-cols-1 gap-6">
                                        {events.map(event => (
                                            <div key={event._id} className="group bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/30 transition-all duration-300 flex flex-col md:flex-row gap-8 items-center">
                                                <div className="w-full md:w-48 aspect-[16/10] bg-transparent rounded-2xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800 relative">
                                                    {event.image ? (
                                                       <img src={event.image.startsWith('/uploads') ? backendUrl + event.image : event.image} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700" />
                                                    ) : (
                                                       <div className="w-full h-full flex items-center justify-center"><Calendar className="w-10 h-10 text-zinc-800" /></div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                                    <div className="absolute bottom-3 left-3 text-[9px] font-black uppercase text-emerald-400 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                                                       {event.category}
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Organized by {event.organizer?.name}</span>
                                                    </div>
                                                    <h4 className="text-2xl font-black text-zinc-900 dark:text-white group-hover:text-emerald-400 transition-colors mb-4 truncate leading-tight uppercase tracking-tight">{event.title}</h4>
                                                    <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500">
                                                        <span className="flex items-center gap-2 font-bold"><Calendar className="w-4 h-4 text-emerald-500" /> {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        <span className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${event.isApproved ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                            {event.isApproved ? <CheckCircle className="w-4 h-4" /> : <Sparkles className="w-4 h-4 animate-pulse" />}
                                                            {event.isApproved ? 'Vetted' : 'Under Review'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex md:flex-col gap-3 shrink-0">
                                                    <button
                                                        onClick={() => fetchEventInsights(event._id)}
                                                        className="px-6 py-3 bg-transparent hover:bg-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:text-white rounded-2xl transition-all border border-zinc-200 dark:border-zinc-800 flex items-center gap-3"
                                                    >
                                                        <TrendingUp className="w-4 h-4" />
                                                        Audit
                                                    </button>
                                                    <button onClick={() => deleteEvent(event._id)} className="p-3 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-zinc-900 dark:text-white rounded-2xl transition-all border border-red-500/10">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* INSIGHTS VIEW (Admin Context) */}
                            {activeStep === 'insights' && (
                                <motion.div key="insights" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                                    <div className="flex flex-col md:flex-row md:items-center gap-8 border-b border-zinc-900 pb-12">
                                        <button onClick={() => setActiveStep('events')} className="w-14 h-14 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-all shadow-xl">
                                            <ArrowLeft className="w-6 h-6 text-zinc-900 dark:text-white" />
                                        </button>
                                        <div>
                                            <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none mb-4 uppercase">Asset Audit</h2>
                                            <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em]">{events.find(e => e._id === selectedEventId)?.title}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Capital Yield</p>
                                            <h3 className="text-4xl font-black text-emerald-500">{currency}{viewingEventStats?.revenue || 0}</h3>
                                        </div>
                                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Inventory Distribution</p>
                                            <h3 className="text-4xl font-black text-blue-500">{viewingEventStats?.ticketsSold || 0} <span className="text-sm">TICKETS</span></h3>
                                        </div>
                                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Primary Entity</p>
                                            <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{events.find(e => e._id === selectedEventId)?.organizer?.name}</h3>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl">
                                        <div className="p-10 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-transparent/20">
                                            <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-widest hover:text-emerald-400 transition-colors">Yield History</h3>
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-transparent/50 text-[10px] uppercase font-black text-zinc-600 tracking-[0.3em]">
                                                    <tr>
                                                        <th className="py-6 px-10">Entity Name</th>
                                                        <th className="py-6 px-10 text-center">Volume</th>
                                                        <th className="py-6 px-10 text-center">Yield</th>
                                                        <th className="py-6 px-10 text-right">Timestamp</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-800/50">
                                                    {eventBookings.map(booking => (
                                                        <tr key={booking._id} className="hover:bg-transparent/30 transition-colors group">
                                                            <td className="py-6 px-10">
                                                                <p className="font-black text-zinc-900 dark:text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{booking.userId?.name || 'Anonymous'}</p>
                                                                <p className="text-[10px] text-zinc-600 font-bold">{booking.userId?.email}</p>
                                                            </td>
                                                            <td className="py-6 px-10 text-center font-bold text-zinc-500 dark:text-zinc-400">{booking.tickets}</td>
                                                            <td className="py-6 px-10 text-center font-black text-emerald-500">{currency}{booking.totalAmount}</td>
                                                            <td className="py-6 px-10 text-right text-zinc-600 font-black text-[10px] uppercase tracking-widest">{new Date(booking.createdAt).toLocaleDateString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* PROPOSALS (ORGANIZER REQUESTS) */}
                            {activeStep === 'organizers' && (
                                <motion.div key="organizers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                                    <header>
                                        <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4">Operator Proposals</h2>
                                        <p className="text-zinc-500 font-medium text-lg">Vetting new professional accounts and credentials.</p>
                                    </header>

                                    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-transparent/50 text-[10px] uppercase font-black text-zinc-600 tracking-[0.3em]">
                                                    <tr>
                                                        <th className="py-6 px-10">Candidate</th>
                                                        <th className="py-6 px-10 text-center">Credentials</th>
                                                        <th className="py-6 px-10 text-right">Disposition</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-800/50">
                                                    {pendingOrganizers.length === 0 ? (
                                                        <tr><td colSpan="3" className="py-24 text-center text-zinc-700 font-black uppercase tracking-[0.4em] text-sm">No Active Proposals</td></tr>
                                                    ) : pendingOrganizers.map(org => (
                                                        <tr key={org._id} className="hover:bg-transparent/30 transition-colors group">
                                                            <td className="py-6 px-10">
                                                                <p className="font-black text-zinc-900 dark:text-white group-hover:text-emerald-400 Transition-colors uppercase tracking-tight">{org.name}</p>
                                                                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{org.email}</p>
                                                            </td>
                                                            <td className="py-6 px-10 text-center">
                                                                {org.kycDetails && <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded-full border border-emerald-500/20">KYC VERIFIED</span>}
                                                            </td>
                                                            <td className="py-6 px-10 text-right">
                                                                <div className="flex justify-end gap-3">
                                                                    {org.kycDetails && (
                                                                        <button
                                                                            onClick={() => { setViewingKYC(org.kycDetails); setIsKYCModalOpen(true); }}
                                                                            className="px-6 py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-emerald-400 hover:border-emerald-500 transition-all text-[9px] font-black uppercase tracking-widest rounded-xl"
                                                                        >
                                                                            Review Dossier
                                                                        </button>
                                                                    )}
                                                                    <button onClick={() => approveOrganizer(org._id)} className="px-6 py-2.5 bg-emerald-600 text-zinc-900 dark:text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 transition-all active:scale-95">Approve</button>
                                                                    <button onClick={() => rejectOrganizer(org._id)} className="px-6 py-2.5 border border-red-500/30 text-red-500/60 hover:text-red-500 hover:border-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Reject</button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>
                </div>
            </div>

            {/* KYC Viewer Modal - Premium Glass Design */}
            <AdminKYCModal
                isOpen={isKYCModalOpen}
                kyc={viewingKYC}
                onClose={() => setIsKYCModalOpen(false)}
                onApprove={() => { approveOrganizer(viewingKYC.userId); setIsKYCModalOpen(false); }}
                onReject={() => { rejectOrganizer(viewingKYC.userId); setIsKYCModalOpen(false); }}
            />
        </div>
    );
};

const AdminKYCModal = ({ isOpen, kyc, onClose, onApprove, onReject }) => {
    const { backendUrl } = useContext(AppContent);
    if (!isOpen || !kyc) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            ></motion.div>
            
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 w-full max-w-6xl rounded-[3rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] border border-white/10 relative z-10 flex flex-col max-h-[90vh]"
            >
                <div className="p-10 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-transparent/20">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden border-2 border-emerald-500/50 p-1">
                            {kyc.profilePhoto ? (
                                <img src={backendUrl + kyc.profilePhoto} alt="Profile" className="w-full h-full object-cover rounded-[1rem]" />
                            ) : (
                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600"><User /></div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">{kyc.fullName}</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em]">Official Dossier Review</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-full transition-colors"><X /></button>
                </div>

                <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-12 overflow-y-auto no-scrollbar">
                    {/* Data column */}
                    <div className="lg:col-span-12 xl:col-span-7 space-y-12">
                        <section>
                            <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.4em] mb-8 border-l-4 border-emerald-500 pl-4">Primary Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <InfoItem label="Date of Birth" value={new Date(kyc.dob).toLocaleDateString()} />
                                <InfoItem label="Gender" value={kyc.gender} />
                                <InfoItem label="Serial Rank" value={kyc.phoneNumber} />
                                <InfoItem label="Father" value={kyc.fatherName} />
                                <InfoItem label="Mother" value={kyc.motherName} />
                                <InfoItem label="Occupation" value={kyc.occupation} />
                            </div>
                        </section>

                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-6">Registered Address</h3>
                                <div className="bg-transparent p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 space-y-2">
                                    <p className="text-sm font-black text-zinc-900 dark:text-white">{kyc.permanentAddress.district} DIST.</p>
                                    <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{kyc.permanentAddress.municipality}, WARD {kyc.permanentAddress.ward}</p>
                                    <p className="text-[10px] font-black text-zinc-600 mt-2 uppercase">{kyc.permanentAddress.villageStreet}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-6">Current Location</h3>
                                <div className="bg-transparent p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 space-y-2">
                                    <p className="text-sm font-black text-zinc-900 dark:text-white">{kyc.currentAddress.district} DIST.</p>
                                    <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{kyc.currentAddress.municipality}, WARD {kyc.currentAddress.ward}</p>
                                    <p className="text-[10px] font-black text-zinc-600 mt-2 uppercase">{kyc.currentAddress.villageStreet}</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-[10px] font-black uppercase text-teal-500 tracking-[0.4em] mb-8 border-l-4 border-teal-500 pl-4">Digital Identity Token</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoItem label="Token Type" value={kyc.idType} />
                                <InfoItem label="Identity Serial" value={kyc.idNumber} />
                                <InfoItem label="Emission Date" value={new Date(kyc.issueDate).toLocaleDateString()} />
                                <InfoItem label="Registry Office" value={kyc.issueDistrict} />
                            </div>
                        </section>
                    </div>

                    {/* Images column */}
                    <div className="lg:col-span-12 xl:col-span-5 space-y-10">
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-4">Master Identity Artifacts</h3>
                            <div className="space-y-4">
                                <div className="rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 group shadow-2xl">
                                    <div className="bg-transparent/80 p-3 text-center text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 group-hover:bg-emerald-500 group-hover:text-zinc-900 dark:text-white transition-all">Front Artifact</div>
                                    <img src={backendUrl + kyc.idFront} alt="ID Front" className="w-full h-auto object-contain bg-transparent group-hover:scale-105 transition-transform duration-700 max-h-[300px]" />
                                </div>
                                <div className="rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 group shadow-2xl">
                                    <div className="bg-transparent/80 p-3 text-center text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 group-hover:bg-emerald-500 group-hover:text-zinc-900 dark:text-white transition-all">Back Artifact</div>
                                    <img src={backendUrl + kyc.idBack} alt="ID Back" className="w-full h-auto object-contain bg-transparent group-hover:scale-105 transition-transform duration-700 max-h-[300px]" />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {kyc.status === 'pending' && (
                    <div className="p-10 bg-transparent/50 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4">
                        <button onClick={onApprove} className="flex-1 py-5 bg-emerald-600 text-zinc-900 dark:text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20 active:scale-95">Verify Operator</button>
                        <button onClick={onReject} className="flex-1 py-5 border-2 border-red-500/30 text-red-500/80 hover:text-red-500 hover:border-red-500 rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95">Reject Candidate</button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div className="bg-transparent p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 transition-all hover:bg-white dark:bg-zinc-900">
        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
        <p className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight truncate">{value || 'UNSPECIFIED'}</p>
    </div>
);

export default AdminDashboard;

