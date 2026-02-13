import { createContext, useState, useEffect } from "react"; // Added useEffect
import axios from "axios"; // Added axios import
import { toast } from "react-toastify";

export const AppContent = createContext();

export const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const getAuthState = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/auth/is-auth', {
                withCredentials: true
            });
            if (data.success) {
                setIsLoggedin(true);
                setUserData(data.userData);
            } else {
                setIsLoggedin(false);
                setUserData(null);
            }
        } catch (error) {
            // Silently fail for background check
            setIsLoggedin(false);
            setUserData(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { // Fixed: userEffect → useEffect
        getAuthState();
    }, []); // Added empty dependency array

    const getUserData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/data', {
                withCredentials: true
            });
            if (data.success) {
                setUserData(data.userData); // Changed from data.userDate to data.userData
            }
        } catch (error) {
            console.log("Failed to get user data:", error.message);
        }
    }

    const [searchQuery, setSearchQuery] = useState('');

    const currency = 'रू';

    const value = {
        backendUrl,
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        getUserData,
        loading,
        searchQuery,
        setSearchQuery,
        currency
    }

    return (
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    );
}