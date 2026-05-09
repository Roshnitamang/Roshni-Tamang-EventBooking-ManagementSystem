import React, { useContext, useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, Sparkles, Eye, EyeOff, Check, ShieldCheck, Info } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { memo } from 'react'


const Login = () => {
  const navigate = useNavigate()
  const { backendUrl, setIsLoggedin, setUserData, isLoggedin, userData } = useContext(AppContent)

  const location = useLocation()
  const [state, setState] = useState(location.state?.mode === 'login' ? 'login' : 'sign up')
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [redirectPath, setRedirectPath] = useState(null)

  useEffect(() => {
    if (isLoggedin && userData) {
      let path = '/dashboard'
      if (userData.role === 'super-admin') path = '/super-admin-dashboard'
      else if (userData.role === 'admin') path = '/admin-dashboard'
      else if (userData.role === 'organizer') path = '/organizer-dashboard'
      navigate(path, { replace: true })
    }
  }, [isLoggedin, userData, navigate])

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
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [accountType, setAccountType] = useState('user')
  const [loading, setLoading] = useState(false)

  const getPasswordStrength = (pass) => {
    let strength = 0
    if (pass.length >= 8) strength += 1
    if (/[A-Z]/.test(pass)) strength += 1
    if (/[0-9]/.test(pass)) strength += 1
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1
    return strength
  }

  const passwordStrength = getPasswordStrength(password)

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    if (state === 'sign up' && password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (state === 'sign up' && passwordStrength < 3) {
      toast.error("Please use a stronger password")
      return
    }
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
          if (data.token) {
            localStorage.setItem('token', data.token)
          }

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
        if (data.token) {
          localStorage.setItem('token', data.token)
        }

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

  const GoogleLoginButton = useMemo(() => (
    <GoogleLogin
      onSuccess={onGoogleSuccess}
      onError={onGoogleError}
      theme={document.documentElement.classList.contains('dark') ? 'filled_black' : 'outline'}
      shape="pill"
      width="350"
      use_fedcm_for_prompt={false}
      locale="en"
      text={state === 'sign up' ? 'signup_with' : 'signin_with'}
    />
  ), [state]); // Only re-render when state changes (login vs signup text)


  const handleCloseModal = () => {
    setShowModal(false)
    if (redirectPath) {
      navigate(redirectPath)
      setRedirectPath(null)
    }
  }

  return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 p-4 sm:p-6 md:p-8 transition-colors duration-500 relative overflow-hidden">
      
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-emerald-900/10 rounded-full blur-[100px]"></div>

      <div className="relative z-10 w-full max-w-6xl bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:grid md:grid-cols-2 min-h-[700px]">

        {/* LEFT PANEL - BRANDING (SaaS Style) */}
        <div className="hidden md:flex flex-col justify-between p-16 bg-emerald-950 relative overflow-hidden border-r border-emerald-900/50">
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter text-white">PLANORA</h1>
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">Simple Event Planning</p>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-6xl font-black text-white tracking-tighter leading-[0.9] mb-8">
                {state === 'sign up' ? "CREATE YOUR EVENT." : "WELCOME BACK."}
              </h2>
              <div className="space-y-6">
                {[
                  { icon: Check, text: "Easy Event Planning" },
                  { icon: Check, text: "Live Guest Tracking" },
                  { icon: Check, text: "Detailed Reports" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-emerald-100/60">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <item.icon className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span className="text-sm font-bold tracking-tight">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="relative z-10 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-emerald-950 bg-emerald-900/50 flex items-center justify-center text-[10px] font-bold text-emerald-500/50">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/50">Joined by 2.4k+ Organizers</p>
          </div>
        </div>

        {/* RIGHT PANEL - FORM */}
        <div className="p-8 sm:p-12 md:p-20 flex flex-col justify-center relative overflow-y-auto max-h-screen md:max-h-none">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-6">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Enterprise Security Enabled</span>
              </div>
              <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter mb-3 leading-none">
                {state === 'sign up' ? 'Create Account' : 'Login'}
              </h2>
              <p className="text-zinc-500 font-bold text-sm tracking-tight">
                {state === 'sign up' ? 'Enter your details to get started' : 'Enter your details to login'}
              </p>
            </div>

            <form onSubmit={onSubmitHandler} className="space-y-5">
              <AnimatePresence mode="wait">
                {state === 'sign up' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="relative group"
                  >
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl outline-none font-bold transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl outline-none font-bold transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
                />
              </div>

              <div className="space-y-2">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-12 pr-12 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl outline-none font-bold transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {state === 'sign up' && password && (
                  <div className="px-1 py-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Password Strength</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                        passwordStrength <= 1 ? 'text-rose-500' : passwordStrength <= 3 ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {passwordStrength <= 1 ? 'Weak' : passwordStrength <= 3 ? 'Medium' : 'Strong'}
                      </span>
                    </div>
                    <div className="flex gap-1.5 h-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-500 ${
                            i <= passwordStrength 
                              ? (passwordStrength <= 1 ? 'bg-rose-500' : passwordStrength <= 3 ? 'bg-amber-500' : 'bg-emerald-500')
                              : 'bg-zinc-200 dark:bg-zinc-800'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] text-zinc-500 flex items-start gap-1.5">
                      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      Must include uppercase, numbers, and symbols for better security.
                    </p>
                  </div>
                )}
              </div>

              {state === 'sign up' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group"
                >
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="w-full pl-12 pr-12 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl outline-none font-bold transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-500 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </motion.div>
              )}

              {state === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/reset-password')}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 hover:text-emerald-400 transition-all hover:translate-x-1"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 dark:bg-emerald-600 text-white font-black uppercase tracking-[0.3em] text-xs rounded-2xl hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-[0.98] group mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{state === 'sign up' ? 'Sign Up' : 'Login'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {state === 'sign up' && (
              <p className="mt-6 text-[10px] text-zinc-500 text-center leading-relaxed">
                By signing up, you agree to our <span className="text-zinc-900 dark:text-white font-bold cursor-pointer hover:text-emerald-500 underline decoration-emerald-500/30">Terms of Service</span> and <span className="text-zinc-900 dark:text-white font-bold cursor-pointer hover:text-emerald-500 underline decoration-emerald-500/30">Privacy Policy</span>.
              </p>
            )}

            <div className="mt-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-zinc-100 dark:bg-zinc-800 flex-1"></div>
                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.4em]">Or Continue With</span>
                <div className="h-px bg-zinc-100 dark:bg-zinc-800 flex-1"></div>
              </div>

              <div className="flex justify-center transition-all hover:scale-[1.02]">
                {GoogleLoginButton}
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-zinc-500 text-xs font-bold">
                {state === 'sign up' ? 'Already have an account?' : "New here?"}
                <button
                  onClick={() => {
                    setState(state === 'sign up' ? 'login' : 'sign up')
                    setAccountType('user')
                    setName('')
                    setEmail('')
                    setPassword('')
                    setConfirmPassword('')
                  }}
                  className="ml-3 text-zinc-900 dark:text-white hover:text-emerald-500 font-black uppercase tracking-widest text-[10px] transition-all border-b-2 border-emerald-500/0 hover:border-emerald-500 pb-0.5"
                >
                  {state === 'sign up' ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL (Glassmorphism Style) */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[3rem] p-12 max-w-sm w-full shadow-2xl text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-emerald-500 rotate-3">
                <Sparkles className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4 uppercase">Notice</h3>
              <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm mb-10 leading-relaxed italic">"{modalMessage}"</p>
              <button
                onClick={handleCloseModal}
                className="w-full py-5 bg-zinc-900 dark:bg-emerald-600 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-[1.5rem] hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
  )
}

export default Login

