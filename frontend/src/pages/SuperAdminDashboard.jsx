import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import SiteSettingsDashboard from '../components/SiteSettingsDashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Settings,
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
    CheckCircle,
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

const SuperAdminDashboard = () => {
    const { backendUrl, currency } = useContext(AppContent);
    const location = useLocation();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [pendingOrganizers, setPendingOrganizers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(location.state?.activeStep || 'stats'); // stats, analytics, users, events, organizers, settings, insights

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
        if (!confirm("Permanently delete this user account?")) return;
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
                                <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-teal-900/20">
                                    <Sparkles className="w-6 h-6 text-zinc-900 dark:text-white" />
                                </div>
                                <h1 className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">Planora <span className="text-teal-500">Elite</span></h1>
                            </div>
                            <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping"></div>
                               <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500">Super Admin Authority</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <NavLink id="stats" label="Overview" icon={LayoutDashboard} />
                            <NavLink id="analytics" label="Analytics" icon={BarChart3} />
                        </div>
                        
                        <div className="pt-10 pb-4">
                            <h3 className="px-5 text-[9px] font-black text-zinc-600 uppercase mb-4 tracking-[0.3em]">Master Infrastructure</h3>
                            <div className="space-y-1">
                                <NavLink id="users" label="Users" icon={Users} />
                                <NavLink id="events" label="All Events" icon={Calendar} />
                                <NavLink id="organizers" label="Activity Monitor" icon={Briefcase} badge={pendingOrganizers.length} />
                                <NavLink id="settings" label="Appearance" icon={Settings} />
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
                                        <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4 uppercase">Dashboard Overview</h2>
                                        <p className="text-zinc-500 font-medium text-lg">Cross-cluster infrastructure metrics and totals.</p>
                                    </header>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[
                                            { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'emerald' },
                                            { label: 'Total Revenue', value: `${currency}${stats?.totalRevenue || 0}`, icon: DollarSign, color: 'emerald' },
                                            { label: 'Total Visits', value: stats?.totalBookings || 0, icon: Ticket, color: 'teal' }
                                        ].map((s, i) => (
                                            <div key={i} className="group bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 hover:border-teal-500/30 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl -mr-12 -mt-12"></div>
                                                <div className="relative z-10 flex flex-col gap-6">
                                                    <div className={`p-4 rounded-2xl w-fit ${
                                                        s.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-teal-500/10 text-teal-500'
                                                    } group-hover:scale-110 transition-transform duration-300 shadow-2xl`}>
                                                        <s.icon className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">{s.label}</p>
                                                        <h3 className="text-4xl font-black text-zinc-900 dark:text-white">{s.value}</h3>
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
                                        <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4 uppercase">Analytics</h2>
                                        <p className="text-zinc-500 font-medium text-lg">Visualizing platform growth trajectories.</p>
                                    </header>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800">
                                            <div className="flex items-center gap-3 mb-10">
                                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                                    <LineIcon className="w-5 h-5 text-emerald-500" />
                                                </div>
                                                <h3 className="font-black text-sm uppercase tracking-widest text-zinc-600 dark:text-zinc-300">Revenue Trajectory</h3>
                                            </div>
                                            <div className="h-[300px]">
                                                {stats?.revenueTrend && (
                                                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                                        <AreaChart data={stats.revenueTrend}>
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
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800">
                                            <div className="flex items-center gap-3 mb-10">
                                                <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center">
                                                    <PieIcon className="w-5 h-5 text-teal-500" />
                                                </div>
                                                <h3 className="font-black text-sm uppercase tracking-widest text-zinc-600 dark:text-zinc-300">Category Density</h3>
                                            </div>
                                            <div className="h-[300px]">
                                                {stats?.categoryStats && (
                                                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                                        <PieChart>
                                                            <Pie
                                                                data={stats.categoryStats}
                                                                innerRadius={60}
                                                                outerRadius={100}
                                                                paddingAngle={8}
                                                                dataKey="value"
                                                                stroke="none"
                                                            >
                                                                {stats.categoryStats.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px' }} />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </div>
                                        </div>

                                        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800">
                                            <div className="flex items-center gap-3 mb-10">
                                                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                                    <BarChart3 className="w-5 h-5 text-blue-500" />
                                                </div>
                                                <h3 className="font-black text-sm uppercase tracking-widest text-zinc-600 dark:text-zinc-300">Elite Performance Collections</h3>
                                            </div>
                                            <div className="h-[300px]">
                                                {stats?.topEvents && (
                                                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                                        <BarChart data={stats.topEvents} layout="vertical" margin={{ left: 40 }}>
                                                            <XAxis type="number" hide />
                                                            <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 10, fontWeight: '900', fill: '#71717a' }} stroke="none" />
                                                            <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px' }} />
                                                            <Bar dataKey="revenue" fill="#10B981" radius={[0, 10, 10, 0]} barSize={24} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* USER MANAGEMENT */}
                            {activeStep === 'users' && (
                                <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                        <div>
                                            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4 uppercase">User Management</h2>
                                            <p className="text-zinc-500 font-medium text-lg">Manage and oversee all registered platform users.</p>
                                        </div>
                                    </header>

                                    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl">
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-max text-left font-sans">
                                                <thead className="bg-transparent/50 text-[10px] uppercase font-black text-zinc-500 tracking-[0.3em]">
                                                    <tr>
                                                        <th className="py-6 px-10">User Info</th>
                                                        <th className="py-6 px-10 text-center">Current Role</th>
                                                        <th className="py-6 px-10 text-center">Change Role</th>
                                                        <th className="py-6 px-10 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-800/50">
                                                    {users.map(user => (
                                                        <tr key={user._id} className="hover:bg-transparent/30 transition-colors group">
                                                            <td className="py-6 px-10">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-black text-zinc-500 group-hover:bg-teal-600 group-hover:text-zinc-900 dark:text-white transition-all">
                                                                        {user.name[0]}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-zinc-900 dark:text-white text-base group-hover:text-teal-400 transition-colors">{user.name}</p>
                                                                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{user.email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-6 px-10 text-center">
                                                                <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap 
                                                                    ${user.role === 'super-admin' ? 'bg-teal-50 text-teal-600 border border-teal-500/20' :
                                                                        user.role === 'admin' ? 'bg-emerald-50 text-emerald-600 border border-emerald-500/20' :
                                                                            user.role === 'organizer' ? 'bg-blue-50 text-blue-600 border border-blue-500/20' :
                                                                                'bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-700'}`}>
                                                                    {user.role}
                                                                </span>
                                                            </td>
                                                            <td className="py-6 px-10 text-center">
                                                                {user.role !== 'super-admin' && (
                                                                    <select
                                                                        className="bg-transparent border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl outline-none focus:border-teal-500 transition-all cursor-pointer"
                                                                        value={user.role}
                                                                        onChange={(e) => updateUserRole(user._id, e.target.value)}
                                                                    >
                                                                        <option value="user">USER</option>
                                                                        <option value="organizer">ORGANIZER</option>
                                                                        <option value="admin">ADMIN</option>
                                                                    </select>
                                                                )}
                                                            </td>
                                                            <td className="py-6 px-10">
                                                                <div className="flex items-center justify-end gap-3 min-w-[120px]">
                                                                    {user.kycDetails && (
                                                                        <button
                                                                            onClick={() => { setViewingKYC(user.kycDetails); setIsKYCModalOpen(true); }}
                                                                            className="p-3 bg-teal-500/5 text-teal-500 hover:bg-teal-500 hover:text-zinc-900 dark:text-white rounded-xl transition-all"
                                                                            title="Review Credentials"
                                                                        >
                                                                            <ShieldCheck className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                    {user.role !== 'super-admin' && (
                                                                        <button onClick={() => deleteUser(user._id)} className="p-3 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-zinc-900 dark:text-white rounded-xl transition-all">
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

                            {/* GLOBAL ARCHIVES (EVENTS) */}
                            {activeStep === 'events' && (
                                <motion.div key="events" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                                    <header>
                                        <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4 uppercase leading-none">All Events</h2>
                                        <p className="text-zinc-500 font-medium text-lg">Central repository of all scheduled experiences.</p>
                                    </header>

                                    <div className="grid grid-cols-1 gap-6">
                                        {events.map(event => (
                                            <div key={event._id} className="group bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 hover:border-teal-500/30 transition-all duration-300 flex flex-col md:flex-row gap-8 items-center">
                                                <div className="w-full md:w-56 aspect-[16/10] bg-transparent rounded-2xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800 relative">
                                                    {event.image ? (
                                                       <img src={event.image.startsWith('/uploads') ? backendUrl + event.image : event.image} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700" />
                                                    ) : (
                                                       <div className="w-full h-full flex items-center justify-center"><Calendar className="w-10 h-10 text-zinc-800" /></div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                                                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none">Authored by {event.organizer?.name}</span>
                                                    </div>
                                                    <h4 className="text-2xl font-black text-zinc-900 dark:text-white group-hover:text-teal-400 transition-colors mb-6 truncate uppercase tracking-tight">{event.title}</h4>
                                                    <div className="flex flex-wrap items-center gap-6">
                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-transparent rounded-full border border-zinc-200 dark:border-zinc-800">
                                                           <Calendar className="w-3.5 h-3.5 text-teal-500" />
                                                           <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{new Date(event.date).toLocaleDateString()}</span>
                                                        </div>
                                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${event.isApproved ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                            {event.isApproved ? 'SECURED' : 'PENDING'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex md:flex-col gap-3 shrink-0">
                                                    <button onClick={() => fetchEventInsights(event._id)} className="px-8 py-4 bg-transparent hover:bg-teal-600 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:text-white rounded-3xl transition-all border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-3">
                                                        <TrendingUp className="w-4 h-4" /> AUDIT
                                                    </button>
                                                    <button onClick={() => deleteEvent(event._id)} className="p-4 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-zinc-900 dark:text-white rounded-3xl transition-all border border-red-500/10">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* ACTIVITY MONITOR (ORGANIZERS) */}
                            {activeStep === 'organizers' && (
                                <motion.div
                                    key="organizers"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12"
                                >
                                    <header>
                                        <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4 uppercase leading-none">Activity Monitor</h2>
                                        <p className="text-zinc-500 font-medium text-lg">Review and authorize pending organizer credentials.</p>
                                    </header>

                                    <div className="grid grid-cols-1 gap-8">
                                        {pendingOrganizers.length === 0 ? (
                                            <div className="py-32 text-center bg-zinc-100 dark:bg-zinc-900/50 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 border-dashed">
                                                <p className="text-zinc-500 font-black uppercase tracking-[0.4em] text-sm">No Pending Proposals Found</p>
                                            </div>
                                        ) : (
                                            pendingOrganizers.map(org => (
                                                <div key={org._id} className="group bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 hover:border-teal-500/30 transition-all duration-500 flex flex-col md:flex-row gap-10 items-center shadow-2xl">
                                                    <div className="w-24 h-24 rounded-[2rem] bg-zinc-800 flex items-center justify-center font-black text-3xl text-zinc-600 group-hover:bg-teal-600 group-hover:text-zinc-900 dark:text-white transition-all shadow-inner">
                                                        {org.name[0]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Pending Verification</p>
                                                        </div>
                                                        <h4 className="text-3xl font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-tight">{org.name}</h4>
                                                        <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-6">{org.email}</p>
                                                        <div className="flex items-center gap-6">
                                                            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-full border border-zinc-700/50">
                                                                <MapPin className="w-3.5 h-3.5 text-teal-500" />
                                                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{org.location || 'Unknown Sector'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4 w-full md:w-auto">
                                                        <button
                                                            onClick={() => { setViewingKYC(org.kycDetails); setIsKYCModalOpen(true); }}
                                                            className="flex-1 md:flex-none px-8 py-4 bg-teal-600 text-zinc-900 dark:text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-teal-500 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                                                        >
                                                            <ShieldCheck className="w-4 h-4" /> REVIEW
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* SITE SETTINGS */}
                            {activeStep === 'settings' && (
                                <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                                    <header>
                                        <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4 uppercase">Appearance</h2>
                                        <p className="text-zinc-500 font-medium text-lg">Define the global aesthetic parameters of Planora.</p>
                                    </header>
                                    <div className="bg-white dark:bg-zinc-900 p-2 rounded-[3.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl">
                                       <SiteSettingsDashboard />
                                    </div>
                                </motion.div>
                            )}

                            {/* INSIGHTS VIEW (Elite Context) */}
                            {activeStep === 'insights' && (
                                <motion.div key="insights" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                                    <div className="flex flex-col md:flex-row md:items-center gap-10 border-b border-zinc-900 pb-12">
                                        <button onClick={() => setActiveStep('events')} className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-[2rem] flex items-center justify-center hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-all shadow-2xl">
                                            <ArrowLeft className="w-6 h-6 text-zinc-900 dark:text-white" />
                                        </button>
                                        <div>
                                            <h2 className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-none mb-4">Event Overview</h2>
                                            <p className="text-teal-500 font-black text-[12px] uppercase tracking-[0.5em]">{events.find(e => e._id === selectedEventId)?.title}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 relative group overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] -mr-16 -mt-16"></div>
                                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4">Gross Yield</p>
                                            <h3 className="text-5xl font-black text-emerald-500 tracking-tighter">{currency}{viewingEventStats?.revenue || 0}</h3>
                                        </div>
                                        <div className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 relative group overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-[60px] -mr-16 -mt-16"></div>
                                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4">Allocation Volume</p>
                                            <h3 className="text-5xl font-black text-teal-500 tracking-tighter">{viewingEventStats?.ticketsSold || 0}</h3>
                                        </div>
                                        <div className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 relative group overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] -mr-16 -mt-16"></div>
                                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4">Principal Identity</p>
                                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">{events.find(e => e._id === selectedEventId)?.organizer?.name}</h3>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl">
                                        <div className="p-10 border-b border-zinc-200 dark:border-zinc-800 bg-transparent/20">
                                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Booking List</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-transparent/50 text-[10px] uppercase font-black text-zinc-600 tracking-[0.4em]">
                                                    <tr>
                                                        <th className="py-8 px-12">User Name</th>
                                                        <th className="py-8 px-12 text-center">Tickets Booked</th>
                                                        <th className="py-8 px-12 text-center">Amount Paid</th>
                                                        <th className="py-8 px-12 text-right">Booking Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-800/50">
                                                    {eventBookings.map(booking => (
                                                        <tr key={booking._id} className="hover:bg-transparent/30 transition-colors group">
                                                            <td className="py-8 px-12">
                                                                <p className="font-black text-zinc-900 dark:text-white group-hover:text-teal-400 transition-colors uppercase tracking-tight text-lg">{booking.userId?.name || 'Constituent X'}</p>
                                                                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{booking.userId?.email}</p>
                                                            </td>
                                                            <td className="py-8 px-12 text-center font-black text-zinc-500 dark:text-zinc-400 text-lg">{booking.tickets}</td>
                                                            <td className="py-8 px-12 text-center font-black text-emerald-500 text-lg">{currency}{booking.totalAmount}</td>
                                                            <td className="py-8 px-12 text-right text-zinc-700 font-black text-[11px] uppercase tracking-[0.3em]">{new Date(booking.createdAt).toLocaleDateString()}</td>
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

            {/* KYC Viewer Modal */}
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
                className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
            ></motion.div>
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 w-full max-w-6xl rounded-[4rem] overflow-hidden shadow-2xl border border-zinc-200 dark:border-white/5 relative z-10 flex flex-col max-h-[90vh]"
            >
                <div className="p-12 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-transparent/30">
                    <div className="flex items-center gap-10">
                        <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-teal-600 shadow-2xl p-1">
                            {kyc.profilePhoto ? (
                                <img src={backendUrl + kyc.profilePhoto} alt="Profile" className="w-full h-full object-cover rounded-[1.5rem]" />
                            ) : (
                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center"><User className="w-10 h-10 text-zinc-600" /></div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">{kyc.fullName}</h2>
                            <p className="text-teal-500 text-[11px] font-black uppercase tracking-[0.5em] mt-2">Dossier Level: Elite Review</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-16 h-16 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-full transition-all border border-zinc-700 shadow-xl"><X /></button>
                </div>

                <div className="p-12 grid grid-cols-1 lg:grid-cols-12 gap-16 overflow-y-auto no-scrollbar">
                    <div className="lg:col-span-7 space-y-16">
                        <section>
                            <h3 className="text-[11px] font-black uppercase text-teal-500 tracking-[0.4em] mb-10 border-l-8 border-teal-500 pl-6">Physical Parameters</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <InfoItem label="Emission Date" value={new Date(kyc.dob).toLocaleDateString()} />
                                <InfoItem label="Gender Segment" value={kyc.gender} />
                                <InfoItem label="Primary Contact" value={kyc.phoneNumber} />
                                <InfoItem label="Ancestry Root (Father)" value={kyc.fatherName} />
                                <InfoItem label="Ancestry Root (Mother)" value={kyc.motherName} />
                                <InfoItem label="Platform Focus" value={kyc.occupation} />
                            </div>
                        </section>

                        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div>
                                <h3 className="text-[11px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-8">Base Location</h3>
                                <div className="bg-transparent p-8 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 space-y-3">
                                    <p className="text-lg font-black text-zinc-900 dark:text-white">{kyc.permanentAddress.district} DISTRICT</p>
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{kyc.permanentAddress.municipality}, WARD {kyc.permanentAddress.ward}</p>
                                    <p className="text-[11px] font-black text-zinc-700 mt-4 uppercase tracking-tighter">{kyc.permanentAddress.villageStreet}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-[11px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-8">Operation Center</h3>
                                <div className="bg-transparent p-8 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 space-y-3">
                                    <p className="text-lg font-black text-zinc-900 dark:text-white">{kyc.currentAddress.district} DISTRICT</p>
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{kyc.currentAddress.municipality}, WARD {kyc.currentAddress.ward}</p>
                                    <p className="text-[11px] font-black text-zinc-700 mt-4 uppercase tracking-tighter">{kyc.currentAddress.villageStreet}</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-5 space-y-12">
                         <h3 className="text-[11px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-8 border-l-8 border-zinc-200 dark:border-zinc-800 pl-6">Identity Artifacts</h3>
                         <div className="space-y-6">
                            <div className="rounded-[3.5rem] overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl group">
                                <div className="bg-transparent p-4 text-center text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:bg-teal-600 group-hover:text-zinc-900 dark:text-white transition-all">Anterior Scan</div>
                                <img src={backendUrl + kyc.idFront} alt="ID Front" className="w-full h-auto object-contain bg-black group-hover:scale-110 transition-transform duration-1000 max-h-[400px]" />
                            </div>
                            <div className="rounded-[3.5rem] overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl group">
                                <div className="bg-transparent p-4 text-center text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:bg-teal-600 group-hover:text-zinc-900 dark:text-white transition-all">Posterior Scan</div>
                                <img src={backendUrl + kyc.idBack} alt="ID Back" className="w-full h-auto object-contain bg-black group-hover:scale-110 transition-transform duration-1000 max-h-[400px]" />
                            </div>
                         </div>
                    </div>
                </div>

                {kyc.status === 'pending' && (
                    <div className="p-12 bg-transparent/80 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-6">
                        <button onClick={onApprove} className="flex-1 py-6 bg-teal-600 text-zinc-900 dark:text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs hover:bg-teal-500 transition-all shadow-2xl active:scale-95">Authorize Constituent</button>
                        <button onClick={onReject} className="flex-1 py-6 border-2 border-red-500/30 text-red-500/80 hover:text-red-500 hover:border-red-500 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs transition-all active:scale-95">Liquidate Proposal</button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div className="bg-transparent p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800/50 hover:border-teal-500/30 transition-all group">
        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-2 group-hover:text-teal-600 transition-colors uppercase">{label}</p>
        <p className="font-black text-zinc-600 dark:text-zinc-300 uppercase tracking-tight text-base">{value || 'UNSET'}</p>
    </div>
);

export default SuperAdminDashboard;

