import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('theme')
      return savedTheme || 'dark'
    } catch (e) {
      console.warn("Theme storage restricted by browser:", e)
      return 'dark'
    }
  })

  // Function to apply theme to document element
  const applyTheme = (currentTheme) => {
    const root = window.document.documentElement;
    if (currentTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme)
    } catch (e) {
      // Ignore storage errors caused by privacy settings
    }
    applyTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)