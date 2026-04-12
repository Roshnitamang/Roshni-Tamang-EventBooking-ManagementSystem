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
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-white dark:bg-zinc-900 p-6">
            <div className="max-w-md w-full bg-transparent dark:bg-zinc-800 rounded-xl shadow-lg p-8 text-center">
                <h1 className="text-3xl font-bold mb-4 text-zinc-800 dark:text-zinc-900 dark:text-white">Become an Organizer</h1>
                <p className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-300 mb-8">
                    Organizers can create and manage events.
                    <br /><br />
                    <strong>Note:</strong> Your account will be locked for <strong>Admin Approval</strong> immediately after request.
                </p>
                <button
                    onClick={handleRequest}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-zinc-900 dark:text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Request Organizer Access'}
                </button>
                <button onClick={() => navigate(-1)} className="mt-4 text-zinc-500 hover:underline">Cancel</button>
            </div>
        </div>
    );
};

export default RequestOrganizer;

