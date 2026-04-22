import React, { useContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'


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
        if (state === 'sign up') {
          toast.success("Account created successfully. You can now log in.")
          setState('login')
          setAccountType('user')
          setName('')
          setPassword('')
        } else {
          setUserData(data.userData)
          setIsLoggedin(true)

          // Determine redirect path
          let path = '/dashboard'
          if (data.userData?.role === 'super-admin') path = '/super-admin-dashboard'
          else if (data.userData?.role === 'admin') path = '/admin-dashboard'
          else if (data.userData?.role === 'organizer') path = '/organizer-dashboard'

          navigate(path, { state: { welcomeMessage: 'Welcome back!' } })
        }
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

  const onGoogleSuccess = async (response) => {
    try {
      setLoading(true)
      axios.defaults.withCredentials = true
      axios.defaults.baseURL = backendUrl

      const { data } = await axios.post('/api/auth/google-login', {
        idToken: response.credential
      })

      if (data.success) {
        setUserData(data.userData)
        setIsLoggedin(true)

        let path = '/dashboard'
        if (data.userData?.role === 'super-admin') path = '/super-admin-dashboard'
        else if (data.userData?.role === 'admin') path = '/admin-dashboard'
        else if (data.userData?.role === 'organizer') path = '/organizer-dashboard'

        navigate(path, { state: { welcomeMessage: `Welcome back, ${data.userData.name}!` } })
      } else {
        setModalMessage(data.message)
        setShowModal(true)
      }
    } catch (err) {
      setModalMessage(err.response?.data?.message || err.message)
      setShowModal(true)
    } finally {
      setLoading(false)
    }
  }

  const onGoogleError = (error) => {
    console.error("Google Auth Error:", error);
    setModalMessage("Google Authentication Failed. Please ensure your browser allows pop-ups and you have a stable connection.")
    setShowModal(true)
  }


  const handleCloseModal = () => {
    setShowModal(false)
    if (redirectPath) {
      navigate(redirectPath)
      setRedirectPath(null)
    }
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-transparent p-4 transition-colors duration-300 relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-900/10 rounded-full blur-[80px] -ml-24 -mb-24"></div>

      <div className="relative z-10 w-full max-w-5xl bg-zinc-50 dark:bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/50 rounded-[2.5rem] shadow-2xl overflow-hidden grid md:grid-cols-2 min-h-[650px]">

        {/* LEFT PANEL - BRANDING */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-emerald-600 to-emerald-900 text-zinc-900 dark:text-white relative overflow-hidden">
          {/* Layered Abstract Shapes */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-black/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-transparent/20 backdrop-blur-md rounded-xl border border-white/10">
                <Sparkles className="w-6 h-6 text-zinc-900 dark:text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tighter">PLANORA</h1>
            </div>
            <p className="text-emerald-100/80 text-[10px] font-black uppercase tracking-[0.3em] ml-1">Event Management Simplified</p>
          </div>

          <div className="relative z-10">
            <div className="w-12 h-1 bg-white/20 mb-8 rounded-full"></div>
            <h2 className="text-5xl font-black tracking-tighter leading-[0.9] mb-6">
              {state === 'sign up' ? "JOIN THE COMMUNITY." : "WELCOME BACK."}
            </h2>
            <p className="text-lg text-emerald-100 font-medium leading-relaxed max-w-xs">
              {state === 'sign up'
                ? "Create unforgettable experiences and discover local events that matter."
                : "Manage your events, track bookings, and connect with your audience."}
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-emerald-200/40">
            <span>© 2026 Planora Inc.</span>
            <span className="w-1 h-1 rounded-full bg-emerald-500/30"></span>
            <span>Est. 2024</span>
          </div>
        </div>

        {/* RIGHT PANEL - FORM */}
        <div className="p-8 md:p-16 flex flex-col justify-center bg-white/50 dark:bg-white dark:bg-zinc-900/50 backdrop-blur-sm">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Security Verified</span>
              </div>
              <h2 className="text-4xl font-black text-zinc-900 dark:text-zinc-900 dark:text-white tracking-tighter mb-3 leading-none">
                {state === 'sign up' ? 'Create Account' : 'Sign In'}
              </h2>
              <p className="text-zinc-500 font-bold text-sm tracking-tight">
                {state === 'sign up' ? 'Enter your details to get started' : 'Enter your credentials to access your account'}
              </p>
            </div>

            <form onSubmit={onSubmitHandler} className="space-y-4">
              {state === 'sign up' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="overflow-hidden"
                >
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      required={state === 'sign up'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full pl-12 pr-4 py-3.5 bg-transparent/50 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500/50 rounded-xl outline-none font-medium transition-all text-zinc-900 dark:text-white placeholder:text-zinc-600"
                    />
                  </div>
                </motion.div>
              )}

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full pl-12 pr-4 py-3.5 bg-transparent/50 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500/50 rounded-xl outline-none font-medium transition-all text-zinc-900 dark:text-white placeholder:text-zinc-600"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-3.5 bg-transparent/50 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500/50 rounded-xl outline-none font-medium transition-all text-zinc-900 dark:text-white placeholder:text-zinc-600"
                />
              </div>

              {state === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => navigate('/reset-password')}
                    className="text-xs font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary !w-full !py-4 flex items-center justify-center gap-3 group mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{state === 'sign up' ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-zinc-800 flex-1 opacity-50"></div>
                <span className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em]">Secure Social Access</span>
                <div className="h-px bg-zinc-800 flex-1 opacity-50"></div>
              </div>

              <div className="flex justify-center transition-all hover:scale-[1.02]">
                <GoogleLogin
                  onSuccess={onGoogleSuccess}
                  onError={onGoogleError}
                  theme="filled_black"
                  shape="pill"
                  width="350"
                  use_fedcm_for_prompt={true}
                />
              </div>
            </div>

            <div className="mt-10 text-center">
              <p className="text-zinc-500 text-sm font-bold">
                {state === 'sign up' ? 'Already part of Planora?' : "New to the experience?"}
                <button
                  onClick={() => {
                    setState(state === 'sign up' ? 'login' : 'sign up')
                    setAccountType('user')
                    setName('')
                    setEmail('')
                    setPassword('')
                  }}
                  className="ml-2 text-zinc-900 dark:text-white hover:text-emerald-500 font-black uppercase tracking-widest text-[11px] transition-all"
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                <Sparkles className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter mb-3">Notice</h3>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8 leading-relaxed">{modalMessage}</p>
              <button
                onClick={handleCloseModal}
                className="btn-primary !w-full"
              >
                Okay, got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </GoogleOAuthProvider>
  )
}

export default Login

