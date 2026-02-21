import React, { useContext, useEffect } from 'react'
import { useNavigate, NavLink, useLocation } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Notifications from './Notifications'
import ThemeToggle from './ThemeToggle'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { userData, backendUrl, setUserData, setIsLoggedin, isLoggedin, setSearchQuery, locationSearch, setLocationSearch } =
    useContext(AppContent)

  useEffect(() => {
    if (location.state?.welcomeMessage) {
      toast.success(location.state.welcomeMessage, {
        toastId: 'welcome-toast', // Prevent duplicates
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      // Clear welcomeMessage from state but keep other state like mode
      const newState = { ...location.state }
      delete newState.welcomeMessage
      window.history.replaceState(newState, document.title)
    }
  }, [location.state])

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true
      const { data } = await axios.post(backendUrl + '/api/auth/logout')
      if (data.success) {
        setIsLoggedin(false)
        setUserData(null)
        navigate('/login', { state: { welcomeMessage: "Logged out successfully", mode: 'login' } })
      }
    } catch (error) {
      console.error(error)
      navigate('/login', { state: { welcomeMessage: "Logged out", mode: 'login' } })
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 gap-6">

          {/* LOGO */}
          <div
            onClick={() => navigate('/')}
            className="text-2xl font-bold text-blue-600 cursor-pointer"
          >
            Planora
          </div>

          {/* SEARCH BAR */}
          <div className="hidden md:flex flex-1 items-center gap-2">
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2.5 max-w-sm border border-transparent focus-within:border-blue-500/50 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all duration-300">
              <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Location"
                className="bg-transparent flex-1 outline-none text-sm text-gray-700 dark:text-gray-200"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
              />
            </div>
          </div>

          {/* PRIMARY NAV LINKS */}
          <ul className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700 dark:text-gray-300">
            <NavLink to="/" className="hover:text-black dark:hover:text-white">
              Home
            </NavLink>
            <NavLink to="/all-events" className="hover:text-black dark:hover:text-white">
              Find Events
            </NavLink>
            <NavLink to="/organizer-dashboard" className="hover:text-black dark:hover:text-white">
              Create Events
            </NavLink>
            <NavLink to="/help" className="hover:text-black dark:hover:text-white">
              Help Center
            </NavLink>
          </ul>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-4 ml-auto">

            {/* Notifications */}
            {userData && <Notifications />}

            {/* THEME TOGGLE (UNIVERSAL) */}
            <ThemeToggle />

            {/* AUTH */}
            {userData ? (
              <div className="relative group">
                <div className="flex items-center gap-2 cursor-pointer py-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold border-2 border-transparent group-hover:border-blue-400 transition">
                    {userData.name[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                    {userData.name.split(' ')[0]}
                  </span>
                  <svg className="w-4 h-4 text-gray-500 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* DROPDOWN (STABLE) */}
                <div className="absolute right-0 mt-0 w-56 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden py-2">
                    <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-800 mb-1">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-semibold truncate text-gray-800 dark:text-gray-200">{userData.name}</p>
                    </div>
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/40 text-gray-700 dark:text-gray-300 transition"
                    >
                      Profile Settings
                    </button>
                    <button
                      onClick={() =>
                        navigate(
                          userData.role === 'super-admin'
                            ? '/super-admin-dashboard'
                            : userData.role === 'admin'
                              ? '/admin-dashboard'
                              : userData.role === 'organizer'
                                ? '/organizer-dashboard'
                                : '/dashboard'
                        )
                      }
                      className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/40 text-gray-700 dark:text-gray-300 transition"
                    >
                      Dashboard
                    </button>
                    <div className="h-px bg-gray-50 dark:bg-gray-800 my-1"></div>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login', { state: { mode: 'login' } })}
                  className="text-sm font-medium text-gray-700 hover:text-black"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate('/login', { state: { mode: 'signup' } })}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  )
}

export default Navbar
