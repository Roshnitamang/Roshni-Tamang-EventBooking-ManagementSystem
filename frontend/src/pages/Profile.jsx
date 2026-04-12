import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, User, Shield, Phone, Map, Globe, Camera, Mail, Briefcase } from 'lucide-react';
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

    if (!userData) return <div className="min-h-screen bg-transparent flex items-center justify-center text-zinc-500">Loading profile...</div>;

    return (
        <div className="min-h-screen bg-transparent py-20 px-6 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 dark:border-zinc-900 pb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                               <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20 rotate-3">
                                  <User className="text-white w-6 h-6" />
                               </div>
                               <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent tracking-tighter">Profile Settings</h1>
                            </div>
                            <p className="text-zinc-500 font-bold text-lg">Personalize your Planora experience and account details.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${userData.isAccountVerified ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`}></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                                    {userData.isAccountVerified ? 'Verified Account' : 'Pending Verification'}
                                </span>
                            </div>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* MAIN CONTENT */}
                        <div className="lg:col-span-8 space-y-10">
                            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                                
                                <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-10 flex items-center gap-3">
                                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg"><User className="w-5 h-5 text-emerald-500" /></div>
                                    General Information
                                </h2>

                                <form onSubmit={handleUpdateProfile} className="space-y-8 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] ml-2">Display Name</label>
                                            <div className="group relative">
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 focus:border-emerald-500 transition-all outline-none text-zinc-900 dark:text-white font-bold placeholder:text-zinc-700"
                                                    placeholder="Your name"
                                                    required
                                                />
                                                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] ml-2">Email Identity (Locked)</label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={email}
                                                    disabled
                                                    className="w-full bg-transparent/50 border border-zinc-900 rounded-2xl p-5 text-zinc-600 font-bold cursor-not-allowed opacity-60"
                                                />
                                                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-800" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] ml-2">Current Location</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 focus:border-emerald-500 transition-all outline-none text-zinc-900 dark:text-white font-bold placeholder:text-zinc-700"
                                                placeholder="e.g. Kathmandu, Nepal"
                                            />
                                            <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-800 group-focus-within:text-emerald-500 transition-colors" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] ml-2">Security Upgrade (Password)</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 focus:border-emerald-500 transition-all outline-none text-zinc-900 dark:text-white font-bold placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                                                placeholder="••••••••••••"
                                            />
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn-primary !px-12 !py-5 shadow-2xl shadow-emerald-900/20 active:scale-95 disabled:opacity-50"
                                        >
                                            {loading ? 'Processing...' : 'Sync Profile'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* VERIFIED KYC INFORMATION */}
                            {userData.kycDetails && (
                                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                                    
                                    <div className="flex items-center justify-between mb-12">
                                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
                                            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg rotate-3 group-hover:rotate-0 transition-transform"><ShieldCheck className="w-5 h-5 text-emerald-500" /></div>
                                            Verified Identity Record
                                        </h2>
                                        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full border border-emerald-500/20">
                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                Status: {userData.kycDetails.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
                                        <div className="md:col-span-3 space-y-6">
                                            <div className="bg-transparent/50 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800">
                                                <p className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-2">Legal Identity Name</p>
                                                <p className="text-xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                                                    {userData.kycDetails.fullName}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-transparent/50 p-5 rounded-[2rem] border border-zinc-200 dark:border-zinc-800">
                                                    <p className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-1">Document Type</p>
                                                    <p className="font-bold text-zinc-600 dark:text-zinc-300">{userData.kycDetails.idType}</p>
                                                </div>
                                                <div className="bg-transparent/50 p-5 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 transition-all hover:bg-emerald-500/5 cursor-help group/id">
                                                    <p className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-1">ID Serial</p>
                                                    <p className="font-bold text-zinc-600 dark:text-zinc-300">•••• •••• {userData.kycDetails.idNumber.slice(-4)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 flex flex-col items-center justify-center">
                                            <div className="relative group/photo">
                                                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-0 group-hover/photo:opacity-20 transition-opacity rounded-full"></div>
                                                <div className="relative w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-black transform group-hover/photo:scale-105 transition-transform duration-500">
                                                    {userData.kycDetails.profilePhoto ? (
                                                        <img
                                                            src={backendUrl + userData.kycDetails.profilePhoto}
                                                            alt="Verified Profile"
                                                            className="w-full h-full object-cover grayscale-[20%] group-hover/photo:grayscale-0 transition-all duration-700"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                                            <User className="w-12 h-12 text-zinc-700" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center border-4 border-zinc-900 shadow-xl group-hover/photo:rotate-12 transition-transform">
                                                    <ShieldCheck className="w-5 h-5 text-zinc-900 dark:text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-12 pt-10 border-t border-zinc-200 dark:border-zinc-800/50">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded-lg mb-4">
                                            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 tracking-widest">Permanent Registered Address</span>
                                        </div>
                                        <p className="text-zinc-500 font-bold leading-loose tracking-wide">
                                            {userData.kycDetails.currentAddress.villageStreet}, Ward {userData.kycDetails.currentAddress.ward}<br />
                                            {userData.kycDetails.currentAddress.municipality}, {userData.kycDetails.currentAddress.district}, {userData.kycDetails.country}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SIDEBAR */}
                        <div className="lg:col-span-4 space-y-10">
                            {/* Membership Status */}
                            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
                                <h3 className="text-[11px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-8">Access Level</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-6 bg-transparent rounded-[2rem] border border-zinc-200 dark:border-zinc-800">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Member Role</span>
                                        </div>
                                        <span className="text-xs font-black text-emerald-500 uppercase italic px-3 py-1 bg-emerald-500/5 rounded-full border border-emerald-500/10">
                                            {userData.role}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-6 bg-transparent rounded-[2rem] border border-zinc-200 dark:border-zinc-800">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-1.5 h-1.5 rounded-full ${userData.isAccountVerified ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Activation</span>
                                        </div>
                                        {userData.isAccountVerified ? (
                                            <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Active</span>
                                        ) : (
                                            <button 
                                              onClick={() => navigate('/email-verify')} 
                                              className="text-[10px] font-black text-amber-500 uppercase tracking-widest underline decoration-amber-500/30 hover:decoration-amber-500 transition-all"
                                            >
                                                Verify Email
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Organizer Upgrade Card */}
                            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[2.5rem] p-10 text-zinc-900 dark:text-white shadow-2xl shadow-emerald-900/40 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                                
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-white/20 dark:bg-transparent rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
                                       <Briefcase className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-3xl font-black mb-4 tracking-tighter leading-[0.9]">Elevate as Organizer</h3>
                                    <p className="text-emerald-50/70 text-sm mb-10 font-medium leading-relaxed">
                                        Transform from an attendee to a host. Launch your own events and manage a digital box office.
                                    </p>

                                    {userData.role === 'organizer' || userData.role === 'admin' || userData.role === 'super-admin' ? (
                                        <div className="bg-emerald-400/20 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-emerald-200">Current Status</p>
                                            <p className="text-lg font-black tracking-tight">Organizer Privileges Active</p>
                                        </div>
                                    ) : userData.organizerStatus === 'pending' || userData.isOrganizerRequested ? (
                                        <div className="bg-emerald-400/20 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-emerald-200">Current Status</p>
                                            <p className="text-lg font-black tracking-tight underline decoration-white/20">Application Pending Review</p>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleOrganizerRequest}
                                            className="w-full bg-white text-emerald-900 py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-xl active:scale-95"
                                        >
                                            Get Professional Access
                                        </button>
                                    )}
                                </div>
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

