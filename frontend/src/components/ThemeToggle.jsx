import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all duration-300 transform active:scale-95 flex items-center justify-center group"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 group-hover:text-amber-500 transition-colors" />
            ) : (
                <Sun className="w-5 h-5 group-hover:text-amber-400 transition-colors" />
            )}
        </button>
    );
};

export default ThemeToggle;
