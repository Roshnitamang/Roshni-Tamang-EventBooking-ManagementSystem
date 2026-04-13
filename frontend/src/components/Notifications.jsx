import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const { backendUrl, userData } = useContext(AppContent);
    const [notifications, setNotifications] = useState([]);
    const [show, setShow] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/notifications`, { withCredentials: true });
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.notifications.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error("Error fetching notifications");
        }
    };

    useEffect(() => {
        if (userData) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [userData, backendUrl]);

    const handleNotificationClick = async (n) => {
        if (!n.isRead) {
            try {
                await axios.put(`${backendUrl}/api/notifications/${n._id}/read`, {}, { withCredentials: true });
                setNotifications(notifications.map(notif => notif._id === n._id ? { ...notif, isRead: true } : notif));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error("Error marking read");
            }
        }

        // Handle Navigation
        let targetLink = n.link;

        // Fallback for older notifications or specific message types without links
        if (!targetLink) {
            const msg = n.message.toLowerCase();
            if (msg.includes('payment verified') || msg.includes('booking confirmed')) {
                targetLink = '/user-dashboard';
            } else if (msg.includes('organizer request')) {
                targetLink = userData.role === 'super-admin' ? '/super-admin-dashboard' : '/admin-dashboard';
            } else if (msg.includes('new event') || msg.includes('found an event')) {
                // If it's an event notification without a link, we can't do much without the ID
                // but usually these have links now.
            }
        }

        if (targetLink) {
            navigate(targetLink, { state: { activeStep: n.message.toLowerCase().includes('organizer') ? 'organizers' : undefined } });
            setShow(false);
        }
    };

    return (
        <div className="relative">
            <button onClick={() => setShow(!show)} className="relative p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                🔔
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {show && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-xl rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 z-50">
                    <div className="p-3 border-b border-zinc-200 dark:border-zinc-700 font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                        <span>Notifications</span>
                        {unreadCount > 0 && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">{unreadCount} New</span>}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="p-4 text-center text-zinc-500 text-sm font-medium">No notifications</p>
                        ) : (
                            notifications.map(n => (
                                <button
                                    key={n._id}
                                    className={`w-full text-left p-3 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${n.isRead ? 'opacity-60' : 'bg-green-50 dark:bg-green-900/10'}`}
                                    onClick={() => {
                                        console.log("Notification clicked:", n);
                                        handleNotificationClick(n);
                                    }}
                                >
                                    <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">{n.message}</p>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[10px] text-zinc-400 font-bold uppercase">{new Date(n.createdAt).toLocaleTimeString()}</span>
                                        {n.link && <span className="text-[10px] text-green-500 font-black uppercase tracking-tighter">View Event →</span>}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
