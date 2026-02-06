import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const { backendUrl, userData } = useContext(AppContent);
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [pendingOrganizers, setPendingOrganizers] = useState([]);
    const [activeTab, setActiveTab] = useState('stats'); // stats, users, events, organizers
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'stats') fetchStats();
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'events') fetchEvents();
        if (activeTab === 'organizers') fetchPendingOrganizers();
    }, [backendUrl, activeTab]);

    const fetchStats = async () => {
        try {
            setIsLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/admin/stats`, { withCredentials: true });
            if (data.success) setStats(data.stats);
        } catch (error) {
            console.error("Error fetching stats:", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/admin/users`, { withCredentials: true });
            if (data.success) setUsers(data.users);
        } catch (error) {
            console.error("Error fetching users:", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            setIsLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/admin/events`, { withCredentials: true });
            if (data.success) setEvents(data.events);
        } catch (error) {
            console.error("Error fetching events:", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPendingOrganizers = async () => {
        try {
            setIsLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/admin/organizers/pending`, { withCredentials: true });
            if (data.success) setPendingOrganizers(data.organizers);
        } catch (error) {
            console.error("Error fetching pending organizers:", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserRole = async (id, role) => {
        if (!confirm(`Are you sure you want to change this user's role to ${role}?`)) return;
        try {
            const { data } = await axios.put(`${backendUrl}/api/admin/users/${id}/role`, { role }, { withCredentials: true });
            if (data.success) {
                toast.success(data.message);
                fetchUsers();
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
                fetchUsers();
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
                fetchEvents();
            }
        } catch {
            toast.error("Failed to delete event");
        }
    };

    const approveOrganizer = async (id) => {
        try {
            const { data } = await axios.put(`${backendUrl}/api/admin/organizers/${id}/approve`, {}, { withCredentials: true });
            if (data.success) {
                toast.success("Organizer approved");
                fetchPendingOrganizers();
            }
        } catch {
            toast.error("Failed to approve");
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500 mt-1">Management and oversight panel</p>
                    </div>
                    <button
                        onClick={() => {
                            if (activeTab === 'stats') fetchStats();
                            if (activeTab === 'users') fetchUsers();
                            if (activeTab === 'events') fetchEvents();
                            if (activeTab === 'organizers') fetchPendingOrganizers();
                        }}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 mb-8 border-b border-gray-200">
                    {[
                        { id: 'stats', label: 'Overview' },
                        { id: 'users', label: 'User Directory' },
                        { id: 'events', label: 'Events' },
                        { id: 'organizers', label: 'Organizer Requests' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 text-sm font-semibold transition-all relative
                                ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}
                            `}
                        >
                            {tab.label}
                            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
                        </button>
                    ))}
                </div>

                {/* Stats Grid */}
                {activeTab === 'stats' && stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Total Events</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Revenue</p>
                            <p className="text-3xl font-bold text-green-600">${stats.totalRevenue}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Bookings</p>
                            <p className="text-3xl font-bold text-blue-600">{stats.totalBookings}</p>
                        </div>
                    </div>
                )}

                {/* Users Management */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold text-[10px] uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">User Details</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Change Role To</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 italic">
                                {isLoading ? (
                                    <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400">Loading directory...</td></tr>
                                ) : users.map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors not-italic">
                                        <td className="px-6 py-4 text-sm">
                                            <div className="font-bold text-gray-900">{user.name}</div>
                                            <div className="text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                                                    user.role === 'organizer' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* Admin can only toggle User/Organizer */}
                                            {user.role !== 'admin' && user.role !== 'super-admin' ? (
                                                <select
                                                    className="text-xs border border-gray-200 rounded px-2 py-1 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={user.role}
                                                    onChange={(e) => updateUserRole(user._id, e.target.value)}
                                                >
                                                    <option value="user">Standard User</option>
                                                    <option value="organizer">Organizer</option>
                                                </select>
                                            ) : (
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">Locked</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {user.role !== 'admin' && user.role !== 'super-admin' && (
                                                <button onClick={() => deleteUser(user._id)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase">Delete</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Events Management */}
                {activeTab === 'events' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold text-[10px] uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Event</th>
                                    <th className="px-6 py-4">Organizer</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 italic">
                                {isLoading ? (
                                    <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400">Loading events...</td></tr>
                                ) : events.map(event => (
                                    <tr key={event._id} className="hover:bg-gray-50/50 transition-colors not-italic">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 text-sm">{event.title}</div>
                                            <div className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-gray-600">
                                            {event.organizer?.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${event.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {event.isApproved ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => deleteEvent(event._id)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Organizer Requests */}
                {activeTab === 'organizers' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold text-[10px] uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Requested By</th>
                                    <th className="px-6 py-4">Request Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 italic">
                                {isLoading ? (
                                    <tr><td colSpan="3" className="px-6 py-10 text-center text-gray-400">Checking requests...</td></tr>
                                ) : pendingOrganizers.length === 0 ? (
                                    <tr><td colSpan="3" className="px-6 py-10 text-center text-gray-400 font-medium">No pending requests record</td></tr>
                                ) : pendingOrganizers.map(org => (
                                    <tr key={org._id} className="hover:bg-gray-50/50 transition-colors not-italic">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 text-sm">{org.name}</div>
                                            <div className="text-xs text-gray-500">{org.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(org.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => approveOrganizer(org._id)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition shadow-sm"
                                            >
                                                Approve
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminDashboard;
