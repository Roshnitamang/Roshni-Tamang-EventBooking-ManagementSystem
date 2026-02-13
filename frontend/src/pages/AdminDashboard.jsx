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
    ArrowLeft
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

    const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

    // UI Helpers
    const NavLink = ({ id, label, icon: Icon, badge }) => (
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
            {badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {badge}
                </span>
            )}
            {activeStep === id && !badge && <ChevronRight className="w-4 h-4 ml-auto" />}
        </button>
    );

    return (
        <div className="bg-white dark:bg-gray-950 min-h-screen text-gray-900 dark:text-gray-100">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row gap-10">
                    {/* Sidebar Nav */}
                    <div className="md:w-64 space-y-2">
                        <div className="mb-8 px-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-6 h-6 text-blue-600" />
                                <h1 className="text-2xl font-black tracking-tight text-blue-600">Planora Admin</h1>
                            </div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">System Oversight</p>
                        </div>

                        <NavLink id="stats" label="Overview" icon={LayoutDashboard} />
                        <NavLink id="analytics" label="Analytics" icon={BarChart3} />
                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-4 mx-4"></div>
                        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Management</p>
                        <NavLink id="users" label="User Directory" icon={Users} />
                        <NavLink id="events" label="Events" icon={Calendar} />
                        <NavLink id="organizers" label="Organizer Requests" icon={Briefcase} badge={pendingOrganizers.length} />
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            {/* OVERVIEW STEP */}
                            {activeStep === 'stats' && (
                                <motion.div
                                    key="stats"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-8"
                                >
                                    <header>
                                        <h2 className="text-3xl font-bold">System Overview</h2>
                                        <p className="text-gray-500 mt-1">Real-time platform performance metrics.</p>
                                    </header>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[
                                            { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'blue' },
                                            { label: 'Total Events', value: stats?.totalEvents || 0, icon: Calendar, color: 'purple' },
                                            { label: 'Revenue', value: `${currency}${stats?.totalRevenue || 0}`, icon: DollarSign, color: 'green' },
                                            { label: 'Bookings', value: stats?.totalBookings || 0, icon: Ticket, color: 'orange' }
                                        ].map((s, i) => (
                                            <div key={i} className="group bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-900/30 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{s.label}</p>
                                                        <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{s.value}</h3>
                                                    </div>
                                                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${s.color === 'blue' ? 'from-blue-500 to-blue-600' :
                                                        s.color === 'purple' ? 'from-purple-500 to-purple-600' :
                                                            s.color === 'green' ? 'from-green-500 to-green-600' :
                                                                'from-orange-500 to-orange-600'
                                                        } shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                        <s.icon className="w-6 h-6 text-white" />
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
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-8"
                                >
                                    <header>
                                        <h2 className="text-3xl font-bold">Platform Analytics</h2>
                                        <p className="text-gray-500 mt-1">Visual data representation of system trends.</p>
                                    </header>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Revenue Trend */}
                                        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                                            <div className="flex items-center gap-2 mb-6 text-blue-600">
                                                <LineIcon className="w-5 h-5" />
                                                <h3 className="font-bold">Revenue Trend (30 Days)</h3>
                                            </div>
                                            <div className="h-[300px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={stats?.revenueTrend}>
                                                        <defs>
                                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                        <XAxis dataKey="date" hide />
                                                        <YAxis hide />
                                                        <Tooltip />
                                                        <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Category Distribution */}
                                        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                                            <div className="flex items-center gap-2 mb-6 text-purple-600">
                                                <PieIcon className="w-5 h-5" />
                                                <h3 className="font-bold">Event Categories</h3>
                                            </div>
                                            <div className="h-[300px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={stats?.categoryStats}
                                                            innerRadius={60}
                                                            outerRadius={100}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                        >
                                                            {stats?.categoryStats?.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Top Events */}
                                        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                                            <div className="flex items-center gap-2 mb-6 text-green-600">
                                                <BarChart3 className="w-5 h-5" />
                                                <h3 className="font-bold">Top Events by Revenue</h3>
                                            </div>
                                            <div className="h-[300px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={stats?.topEvents} layout="vertical">
                                                        <XAxis type="number" hide />
                                                        <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12, fontWeight: 'bold' }} stroke="#888" />
                                                        <Tooltip />
                                                        <Bar dataKey="revenue" fill="#10B981" radius={[0, 10, 10, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* USER DIRECTORY */}
                            {activeStep === 'users' && (
                                <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                    <header>
                                        <h2 className="text-3xl font-bold">User Directory</h2>
                                        <p className="text-gray-500 mt-1">Manage and update system roles.</p>
                                    </header>
                                    <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                                                <tr>
                                                    <th className="py-4 px-6">User Details</th>
                                                    <th className="py-4 px-6">Role</th>
                                                    <th className="py-4 px-6">Update</th>
                                                    <th className="py-4 px-6 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {users.map(user => (
                                                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                        <td className="py-4 px-6">
                                                            <p className="font-bold text-sm">{user.name}</p>
                                                            <p className="text-xs text-gray-400">{user.email}</p>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-blue-50 text-blue-600' : user.role === 'organizer' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <select
                                                                className="text-xs font-bold bg-transparent outline-none cursor-pointer"
                                                                value={user.role}
                                                                onChange={(e) => updateUserRole(user._id, e.target.value)}
                                                                disabled={user.role === 'super-admin'}
                                                            >
                                                                <option value="user">User</option>
                                                                <option value="organizer">Organizer</option>
                                                                <option value="admin">Admin</option>
                                                            </select>
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            {user.role !== 'super-admin' && (
                                                                <button onClick={() => deleteUser(user._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}

                            {/* EVENTS MANAGEMENT */}
                            {activeStep === 'events' && (
                                <motion.div key="events" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                    <header>
                                        <h2 className="text-3xl font-bold">Global Events</h2>
                                        <p className="text-gray-500 mt-1">Monitor and moderate all scheduled events.</p>
                                    </header>
                                    <div className="space-y-4">
                                        {events.map(event => (
                                            <div key={event._id} className="group bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row gap-6 items-center">
                                                <div className="w-full md:w-32 h-24 bg-gray-100 rounded-2xl overflow-hidden">
                                                    {event.image && <img src={event.image.startsWith('/uploads') ? backendUrl + event.image : event.image} className="w-full h-full object-cover" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{event.category}</span>
                                                        <span className="text-xs text-gray-400 font-medium">by {event.organizer?.name}</span>
                                                    </div>
                                                    <h4 className="text-lg font-bold">{event.title}</h4>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(event.date).toLocaleDateString()}</span>
                                                        <span className={`flex items-center gap-1 font-bold ${event.isApproved ? 'text-green-500' : 'text-orange-500'}`}>
                                                            {event.isApproved ? <CheckCircle className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                                                            {event.isApproved ? 'Approved' : 'Pending Approval'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => fetchEventInsights(event._id)}
                                                        className="px-5 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 text-sm font-bold rounded-xl transition-all flex items-center gap-2"
                                                    >
                                                        <TrendingUp className="w-4 h-4" />
                                                        Insights
                                                    </button>
                                                    <button onClick={() => deleteEvent(event._id)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* INSIGHTS VIEW */}
                            {activeStep === 'insights' && (
                                <motion.div key="insights" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setActiveStep('events')} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 transition-all">
                                            <ArrowLeft className="w-5 h-5 font-bold" />
                                        </button>
                                        <div>
                                            <h2 className="text-3xl font-black tracking-tight">Event Insights (Admin View)</h2>
                                            <p className="text-gray-500">Detailed analytics for "{events.find(e => e._id === selectedEventId)?.title}"</p>
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
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Organizer</p>
                                            <h3 className="text-xl font-bold text-gray-700">{events.find(e => e._id === selectedEventId)?.organizer?.name}</h3>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                                        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                            <h3 className="text-xl font-bold">Full Booking History</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] uppercase font-bold text-gray-400">
                                                    <tr>
                                                        <th className="py-4 px-6">Customer</th>
                                                        <th className="py-4 px-6">Tickets</th>
                                                        <th className="py-4 px-6">Amount</th>
                                                        <th className="py-4 px-6">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                    {eventBookings.map(booking => (
                                                        <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="py-4 px-6 font-bold text-sm">{booking.userId?.name || 'User'}</td>
                                                            <td className="py-4 px-6 text-sm">{booking.tickets}</td>
                                                            <td className="py-4 px-6 text-sm font-black text-green-500">{currency}{booking.totalAmount}</td>
                                                            <td className="py-4 px-6 text-sm text-gray-400">{new Date(booking.createdAt).toLocaleDateString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ORGANIZER REQUESTS */}
                            {activeStep === 'organizers' && (
                                <motion.div key="organizers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                    <header>
                                        <h2 className="text-3xl font-bold">Organizer Requests</h2>
                                        <p className="text-gray-500 mt-1">Review and approve new organizer account requests.</p>
                                    </header>
                                    <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                                                <tr>
                                                    <th className="py-4 px-6">Requester</th>
                                                    <th className="py-4 px-6">Email</th>
                                                    <th className="py-4 px-6 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {pendingOrganizers.length === 0 ? (
                                                    <tr><td colSpan="3" className="py-12 text-center text-gray-400">No pending requests.</td></tr>
                                                ) : pendingOrganizers.map(org => (
                                                    <tr key={org._id}>
                                                        <td className="py-4 px-6 font-bold text-sm">{org.name}</td>
                                                        <td className="py-4 px-6 text-sm text-gray-500">{org.email}</td>
                                                        <td className="py-4 px-6 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => approveOrganizer(org._id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">Approve</button>
                                                                <button onClick={() => rejectOrganizer(org._id)} className="px-4 py-2 border border-red-500 text-red-500 rounded-lg text-xs font-bold uppercase hover:bg-red-50 transition-all">Reject</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

