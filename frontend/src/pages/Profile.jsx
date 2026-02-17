import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Profile = () => {
    const { backendUrl, userData, getUserData } = useContext(AppContent);
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [requestLoading, setRequestLoading] = useState(false);

    useEffect(() => {
        if (userData) {
            setName(userData.name || '');
            setEmail(userData.email || '');
        }
    }, [userData]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data } = await axios.put(`${backendUrl}/api/user/update-profile`,
                { name, email, newPassword },
                { withCredentials: true }
            );
            if (data.success) {
                toast.success(data.message);
                setNewPassword(''); // Clear password field
                getUserData(); // Refresh global state
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOrganizerRequest = async () => {
        if (!confirm("Start organizer approval process? Your request will be sent to administrators for review.")) return;

        try {
            setRequestLoading(true);
            const { data } = await axios.put(`${backendUrl}/api/user/request-organizer`, {}, { withCredentials: true });
            if (data.success) {
                toast.success(data.message);
                getUserData(); // Refresh to show pending status
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setRequestLoading(false);
        }
    };

    if (!userData) return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-6 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <header>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Account Settings</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage your profile information and account preferences.</p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* PROFILE INFO CARD */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <span className="text-2xl">👤</span> General Information
                                </h2>

                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 transition outline-none dark:text-white font-semibold"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 transition outline-none dark:text-white font-semibold"
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">New Password (leave blank to keep current)</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 transition outline-none dark:text-white font-semibold"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>

                            {/* ACCOUNT STATUS CARD */}
                            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <span className="text-2xl">🛡️</span> Account Status
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">Email Verification</p>
                                            <p className="text-xs text-gray-500">Enhanced account security</p>
                                        </div>
                                        {userData.isAccountVerified ? (
                                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-black uppercase">Verified</span>
                                        ) : (
                                            <button onClick={() => navigate('/email-verify')} className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-black uppercase hover:bg-yellow-200 transition">Action Required</button>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">Account Role</p>
                                            <p className="text-xs text-gray-500">Current system permissions</p>
                                        </div>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-black uppercase italic">{userData.role}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SIDEBAR: ORGANIZER REQUEST */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/20">
                                <span className="text-4xl mb-4 block">🎟️</span>
                                <h3 className="text-2xl font-black mb-3 leading-tight">Host Your Own Events</h3>
                                <p className="text-blue-100 text-sm mb-6 font-medium leading-relaxed">
                                    Join our community of organizers. Create experiences, sell tickets, and manage attendees with Planora Studio.
                                </p>

                                {userData.role === 'organizer' || userData.role === 'admin' || userData.role === 'super-admin' ? (
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
                                        <p className="text-xs font-black uppercase tracking-widest mb-1">Status</p>
                                        <p className="text-lg font-bold">Active Professional Account</p>
                                    </div>
                                ) : userData.isOrganizerRequested ? (
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
                                        <p className="text-xs font-black uppercase tracking-widest mb-1">Status</p>
                                        <p className="text-lg font-bold">Request Pending Review</p>
                                        <p className="text-[10px] mt-2 opacity-70">Admin will verify your profile shortly.</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleOrganizerRequest}
                                        disabled={requestLoading}
                                        className="w-full bg-white text-blue-600 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-lg disabled:opacity-50"
                                    >
                                        {requestLoading ? 'Submitting...' : 'Apply as Organizer'}
                                    </button>
                                )}
                            </div>

                            <div className="bg-gray-100 dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-200 dark:border-gray-800 transition-colors">
                                <h4 className="font-bold mb-4 text-gray-900 dark:text-white">Pro Tip</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium italic">
                                    "Keep your name updated so organizers can recognize you at check-in points. Verified accounts usually get tickets 20% faster!"
                                </p>
                            </div>
                        </div>

                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
