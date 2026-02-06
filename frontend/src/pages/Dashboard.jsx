import React, { useContext } from 'react';
import { AppContent } from '../context/AppContext';
import OrganizerDashboard from './OrganizerDashboard';
import AttendeeDashboard from './AttendeeDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
    const { userData } = useContext(AppContent);

    if (!userData) {
        return <div>Loading...</div>; // As context fetches data asynchronously
    }

    if (userData.role === 'organizer') {
        return <OrganizerDashboard />;
    } else if (userData.role === 'admin') {
        return <AdminDashboard />;
    } else {
        return <AttendeeDashboard />;
    }
};

export default Dashboard;
