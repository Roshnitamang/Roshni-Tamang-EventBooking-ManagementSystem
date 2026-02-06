import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div
            onClick={toggleTheme}
            className={`relative flex items-center w-14 h-7 rounded-full cursor-pointer transition-colors duration-300 p-1 
                ${theme === 'light' ? 'bg-blue-100' : 'bg-gray-700'}`}
        >
            <motion.div
                animate={{ x: theme === 'light' ? 0 : 28 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center`}
            >
                {theme === 'light' ? '☀️' : '🌙'}
            </motion.div>
        </div>
    );
};

export default ThemeToggle;
