import React, { useContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const { backendUrl, setIsLoggedin, setUserData } = useContext(AppContent)

  const location = useLocation()
  const [state, setState] = useState(location.state?.mode === 'login' ? 'login' : 'sign up')
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [redirectPath, setRedirectPath] = useState(null)

  useEffect(() => {
    if (location.state?.mode) {
      setState(location.state.mode === 'login' ? 'login' : 'sign up')
    }
    if (location.state?.message) {
      setModalMessage(location.state.message)
      setShowModal(true)
      // Clear state to prevent showing modal again on refresh/navigation
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState('user')
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      axios.defaults.withCredentials = true
      axios.defaults.baseURL = backendUrl

      const url = state === 'sign up' ? '/api/auth/register' : '/api/auth/login'
      const payload = state === 'sign up'
        ? { name, email, password, role: accountType }
        : { email, password }

      const { data } = await axios.post(url, payload)

      if (data.success) {
        setUserData(data.userData)
        setIsLoggedin(true)

        // Determine redirect path
        let path = '/dashboard'
        if (data.userData?.role === 'super-admin') path = '/super-admin-dashboard'
        else if (data.userData?.role === 'admin') path = '/admin-dashboard'
        else if (data.userData?.role === 'organizer') path = '/organizer-dashboard'

        navigate(path, { state: { welcomeMessage: state === 'sign up' ? 'Account created successfully!' : 'Welcome back!' } })
      } else {
        setModalMessage(data.message)
        setRedirectPath(null) // Stay on page
        setShowModal(true)
      }
    } catch (err) {
      setModalMessage(err.response?.data?.message || err.message)
      setRedirectPath(null)
      setShowModal(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    if (redirectPath) {
      navigate(redirectPath)
      setRedirectPath(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 transition-colors duration-300">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden grid md:grid-cols-2 min-h-[600px]">

        {/* LEFT PANEL - BRANDING */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
          {/* Abstract Shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Planora</h1>
            </div>
            <p className="text-blue-100 text-sm font-medium ml-1">Event Management Simplified</p>
          </div>

          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl font-black leading-tight">
              {state === 'sign up' ? "Join the community." : "Welcome back."}
            </h2>
            <p className="text-lg text-blue-100/90 leading-relaxed max-w-xs">
              {state === 'sign up'
                ? "Create unforgettable experiences and discover local events that matter."
                : "Manage your events, track bookings, and connect with your audience."}
            </p>
          </div>

          <div className="relative z-10 text-xs text-blue-200/60 font-medium">
            © 2026 Planora Inc.
          </div>
        </div>

        {/* RIGHT PANEL - FORM */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-gray-900">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {state === 'sign up' ? 'Create Account' : 'Sign In'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {state === 'sign up' ? 'Enter your details to get started' : 'Enter your credentials to access your account'}
              </p>
            </div>

            <form onSubmit={onSubmitHandler} className="space-y-5">
              {state === 'sign up' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="relative group mb-5">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      required={state === 'sign up'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-xl outline-none font-medium transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                    />
                  </div>
                </motion.div>
              )}

              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-xl outline-none font-medium transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-xl outline-none font-medium transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                />
              </div>

              {state === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => navigate('/reset-password')}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {state === 'sign up' ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {state === 'sign up' ? 'Already have an account?' : "Don't have an account?"}
                <button
                  onClick={() => {
                    setState(state === 'sign up' ? 'login' : 'sign up')
                    setAccountType('user')
                    setName('')
                    setEmail('')
                    setPassword('')
                  }}
                  className="ml-2 text-blue-600 dark:text-blue-400 font-bold hover:underline transition-all"
                >
                  {state === 'sign up' ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Notice</h3>
              <p className="text-gray-500 dark:text-gray-300 mb-6">{modalMessage}</p>
              <button
                onClick={handleCloseModal}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
              >
                Okay, got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Login
