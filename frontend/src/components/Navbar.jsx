import React, { useContext, useEffect, useMemo } from 'react'
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

  const dashboardPath = useMemo(() => {
    if (!userData) return '/dashboard'
    switch (userData.role) {
      case 'super-admin': return '/super-admin-dashboard'
      case 'admin': return '/admin-dashboard'
      case 'organizer': return '/organizer-dashboard'
      default: return '/dashboard'
    }
  }, [userData])

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
        localStorage.removeItem('token')
        navigate('/login', { state: { welcomeMessage: "Logged out successfully", mode: 'login' } })
      }
    } catch (error) {
      console.error(error)
      navigate('/login', { state: { welcomeMessage: "Logged out", mode: 'login' } })
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center h-20 gap-8">

          {/* LOGO */}
          <div
            onClick={() => navigate('/')}
            className="text-2xl font-black text-emerald-500 cursor-pointer tracking-tighter flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-900/20">
              <div className="font-black text-white text-lg">P</div>
            </div>
            <span className="hidden sm:block tracking-widest text-xl font-black">PLANORA</span>
          </div>

          {/* SEARCH BAR - Only show for guests and regular users */}
          {(!userData || userData.role === 'user') && (
            <div className="hidden md:flex flex-1 items-center max-w-md">
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-full px-5 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500/50 transition-all duration-300 w-full group">
                <svg className="w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search events..."
                  className="bg-transparent flex-1 outline-none text-sm text-zinc-900 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* PRIMARY NAV LINKS */}
          {userData ? (
            <ul className="hidden lg:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              <li>
                <NavLink to="/profile" className={({ isActive }) => `hover:text-emerald-400 transition-colors ${isActive ? 'text-emerald-500' : ''}`}>
                  Profile
                </NavLink>
              </li>
              <li>
                <NavLink to={dashboardPath} className={({ isActive }) => `hover:text-emerald-400 transition-colors ${isActive ? 'text-emerald-500' : ''}`}>
                  Dashboard
                </NavLink>
              </li>
            </ul>
          ) : (
            <ul className="hidden lg:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              <li>
                <NavLink to="/" className={({ isActive }) => `hover:text-emerald-400 transition-colors ${isActive ? 'text-emerald-500' : ''}`}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/all-events" className={({ isActive }) => `hover:text-emerald-400 transition-colors ${isActive ? 'text-emerald-500' : ''}`}>
                  Find Events
                </NavLink>
              </li>
              <li>
                <NavLink to="/organizer-dashboard" className={({ isActive }) => `hover:text-emerald-400 transition-colors ${isActive ? 'text-emerald-500' : ''}`}>
                  Create
                </NavLink>
              </li>
            </ul>
          )}

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-6 ml-auto">

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            {userData && <Notifications />}

            {/* AUTH */}
            {userData ? (
              <div className="relative group">
                <div className="flex items-center gap-3 cursor-pointer py-2">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-800 group-hover:border-emerald-500/50 flex items-center justify-center text-emerald-500 font-bold overflow-hidden transition-all shadow-inner">
                    {userData.avatar ? (
                      <img src={userData.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      userData.name[0].toUpperCase()
                    )}
                  </div>
                </div>

                {/* DROPDOWN */}
                <div className="absolute right-0 mt-0 w-64 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden py-3">
                    <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 mb-2">
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Logged in as</p>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{userData.name}</p>
                    </div>
                    <button onClick={() => navigate('/profile')} className="w-full text-left px-6 py-3 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-emerald-500 dark:hover:text-emerald-400 transition">
                      Profile
                    </button>
                    <button onClick={() => navigate(dashboardPath)} className="w-full text-left px-6 py-3 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-emerald-500 dark:hover:text-emerald-400 transition">
                      Dashboard
                    </button>
                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2 mx-6"></div>
                    <button onClick={logout} className="w-full text-left px-6 py-3 text-sm font-bold text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition flex items-center gap-2">
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <button
                  onClick={() => navigate('/login', { state: { mode: 'login' } })}
                  className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/login', { state: { mode: 'signup' } })}
                  className="btn-primary"
                >
                  Join Planora
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  )
}

export default Navbar
