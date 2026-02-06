import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';

const SuperAdminDashboard = () => {
    const { backendUrl, userData } = useContext(AppContent);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, [backendUrl]);

    const fetchStats = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/stats`, { withCredentials: true });
            if (data.success) setStats(data.stats);
        } catch (error) {
            console.error("Error fetching stats:", error.message);
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

    const updateUserRole = async (id, role) => {
        const action = role === 'admin' ? 'Promote to Admin' : 'Change Role';
        if (!confirm(`Are you sure you want to change this user's role to ${role}?`)) return;
        try {
            const { data } = await axios.put(`${backendUrl}/api/admin/users/${id}/role`, { role }, { withCredentials: true });
            if (data.success) {
                toast.success(data.message);
                fetchUsers();
            } else {
                toast.error(data.message);
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
                fetchUsers();
            }
        } catch {
            toast.error("Failed to delete user");
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-950 transition-colors duration-300 min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Super Admin Dashboard</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Full system control and user management</p>
                    </div>
                    <button
                        onClick={fetchUsers}
                        className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
                    >
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>

                {/* Quick Stats */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Total Users</p>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalUsers}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">System Revenue</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">${stats.totalRevenue}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Total Bookings</p>
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.totalBookings}</p>
                        </div>
                    </div>
                )}

                {/* User Management */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">User Management</h2>
                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
                            {users.length} Total Users
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium text-sm">
                                <tr>
                                    <th className="px-6 py-4">User Details</th>
                                    <th className="px-6 py-4">Current Role</th>
                                    <th className="px-6 py-4">Change Role To</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 italic">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-gray-400">Loading users...</td>
                                    </tr>
                                ) : users.map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors not-italic">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 dark:text-white">{user.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${user.role === 'super-admin'
                                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                                : user.role === 'admin'
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                    : user.role === 'organizer'
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.role !== 'super-admin' && (
                                                <div className="flex gap-2">
                                                    <select
                                                        className="text-sm border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                        value={user.role}
                                                        onChange={(e) => updateUserRole(user._id, e.target.value)}
                                                    >
                                                        <option value="user">Standard User</option>
                                                        <option value="organizer">Organizer</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {user.role !== 'super-admin' && (
                                                <button
                                                    onClick={() => deleteUser(user._id)}
                                                    className="text-red-500 hover:text-red-700 transition font-medium text-sm"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
