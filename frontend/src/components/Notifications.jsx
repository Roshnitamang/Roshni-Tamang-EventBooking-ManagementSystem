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
        if (n.message.toLowerCase().includes('organizer request')) {
            const targetDashboard = userData.role === 'super-admin' ? '/super-admin-dashboard' : '/admin-dashboard';
            navigate(targetDashboard, { state: { activeStep: 'organizers' } });
            setShow(false);
        }
    };

    return (
        <div className="relative">
            <button onClick={() => setShow(!show)} className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                🔔
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {show && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 shadow-xl rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 font-semibold">Notifications</div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="p-4 text-center text-gray-500">No notifications</p>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n._id}
                                    className={`p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${n.isRead ? 'opacity-50' : 'bg-blue-50 dark:bg-blue-900/10'}`}
                                    onClick={() => handleNotificationClick(n)}
                                >
                                    <p className="text-sm text-gray-800 dark:text-gray-200">{n.message}</p>
                                    <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleTimeString()}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
