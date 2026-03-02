import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, User, Shield, Phone, Map, Globe } from 'lucide-react';
import KYCFormModal from '../components/KYCFormModal';

const Profile = () => {
    const { backendUrl, userData, getUserData } = useContext(AppContent);
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [location, setLocation] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);

    useEffect(() => {
        if (userData) {
            setName(userData.name || '');
            setEmail(userData.email || '');
            setLocation(userData.location || '');
        }
    }, [userData]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data } = await axios.put(`${backendUrl}/api/user/update-profile`,
                { name, location, password: newPassword },
                { withCredentials: true }
            );
            if (data.success) {
                toast.success(data.message);
                setNewPassword('');
                getUserData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOrganizerRequest = () => {
        setIsKYCModalOpen(true);
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
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <User className="w-6 h-6 text-blue-500" /> General Information
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
                                            disabled
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 transition outline-none dark:text-white font-semibold opacity-60 cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Preferred Location</label>
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 transition outline-none dark:text-white font-semibold"
                                            placeholder="Enter your preferred location"
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

                            {/* VERIFIED KYC INFORMATION */}
                            {userData.kycDetails && (
                                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors overflow-hidden">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <User className="w-6 h-6 text-indigo-500" /> Verified Identity
                                        </h2>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${userData.kycDetails.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                            KYC {userData.kycDetails.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Full Identity Name</p>
                                                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                    {userData.kycDetails.fullName}
                                                    {userData.kycDetails.status === 'approved' && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{userData.kycDetails.idType} Number</p>
                                                <p className="font-bold text-gray-900 dark:text-white">•••• •••• {userData.kycDetails.idNumber.slice(-4)}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-center md:justify-end">
                                            <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
                                                {userData.kycDetails.profilePhoto ? (
                                                    <img
                                                        src={backendUrl + userData.kycDetails.profilePhoto}
                                                        alt="Verified Profile"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                        <User className="w-10 h-10 text-gray-300" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                                        <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
                                            <MapPin className="w-3 h-3" /> Permanent Address
                                        </h3>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {userData.kycDetails.permanentAddress.villageStreet}, Ward {userData.kycDetails.permanentAddress.ward}<br />
                                            {userData.kycDetails.permanentAddress.municipality}, {userData.kycDetails.permanentAddress.district}, {userData.kycDetails.country}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SIDEBAR */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <ShieldCheck className="w-6 h-6 text-blue-500" /> Account Status
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">Email</p>
                                        </div>
                                        {userData.isAccountVerified ? (
                                            <span className="text-green-600 font-bold text-xs uppercase">Verified</span>
                                        ) : (
                                            <button onClick={() => navigate('/email-verify')} className="text-yellow-600 font-bold text-xs uppercase underline">Verify Now</button>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">Role</p>
                                        </div>
                                        <span className="text-blue-600 font-bold text-xs uppercase italic">{userData.role}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/20">
                                <span className="text-4xl mb-4 block">🎟️</span>
                                <h3 className="text-2xl font-black mb-3 leading-tight">Host Your Own Events</h3>
                                <p className="text-blue-100 text-sm mb-6 font-medium leading-relaxed">
                                    Join our community of organizers. Create experiences, sell tickets, and manage attendees.
                                </p>

                                {userData.role === 'organizer' || userData.role === 'admin' || userData.role === 'super-admin' ? (
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
                                        <p className="text-xs font-black uppercase tracking-widest mb-1">Status</p>
                                        <p className="text-lg font-bold">Active Professional Account</p>
                                    </div>
                                ) : userData.organizerStatus === 'pending' || userData.isOrganizerRequested ? (
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
                                        <p className="text-xs font-black uppercase tracking-widest mb-1">Status</p>
                                        <p className="text-lg font-bold">Request Pending Review</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleOrganizerRequest}
                                        className="w-full bg-white text-blue-600 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-lg"
                                    >
                                        Become an Organizer
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <KYCFormModal
                isOpen={isKYCModalOpen}
                onClose={() => setIsKYCModalOpen(false)}
            />
        </div>
    );
};

export default Profile;
