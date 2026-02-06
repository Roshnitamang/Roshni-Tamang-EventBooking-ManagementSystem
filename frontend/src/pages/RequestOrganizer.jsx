import React, { useContext, useState } from 'react';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const RequestOrganizer = () => {
    const { backendUrl, userData, setIsLoggedin } = useContext(AppContent);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleRequest = async () => {
        if (!confirm("Start organizer approval process? You will need to re-login after approval.")) return;

        try {
            setLoading(true);
            const { data } = await axios.put(`${backendUrl}/api/user/request-organizer`, {}, { withCredentials: true });
            if (data.success) {
                toast.success(data.message);
                // Logout user because their role status changed/pending
                setIsLoggedin(false);
                navigate('/login');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Become an Organizer</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                    Organizers can create and manage events.
                    <br /><br />
                    <strong>Note:</strong> Your account will be locked for <strong>Admin Approval</strong> immediately after request.
                </p>
                <button
                    onClick={handleRequest}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Request Organizer Access'}
                </button>
                <button onClick={() => navigate(-1)} className="mt-4 text-gray-500 hover:underline">Cancel</button>
            </div>
        </div>
    );
};

export default RequestOrganizer;
