import React, { useContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {
  const navigate = useNavigate()
  const { backendUrl, setIsLoggedin, setUserData, getUserData } = useContext(AppContent)

  const location = useLocation()
  const [state, setState] = useState(location.state?.mode === 'login' ? 'login' : 'sign up')

  useEffect(() => {
    if (location.state?.mode) {
      setState(location.state.mode === 'login' ? 'login' : 'sign up')
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
      axios.defaults.baseURL = backendUrl // Set base URL for axios

      const url =
        state === 'sign up'
          ? '/api/auth/register' // Use relative path
          : '/api/auth/login' // Use relative path

      const payload =
        state === 'sign up'
          ? { name, email, password, role: accountType }
          : { email, password }

      const { data } = await axios.post(url, payload)

      if (data.success) {
        setUserData(data.userData); // Set user data from the response
        setIsLoggedin(true);
        toast.success(state === 'sign up' ? 'Account created!' : 'Welcome back!');

        // Redirect based on role from response
        if (data.userData?.role === 'super-admin') navigate('/super-admin-dashboard');
        else if (data.userData?.role === 'admin') navigate('/admin-dashboard');
        else if (data.userData?.role === 'organizer') navigate('/organizer-dashboard');
        else navigate('/dashboard'); // Attendee
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6efe7] dark:bg-gray-950 px-4 transition-colors duration-300">
      <div className="w-full max-w-5xl bg-[#fffaf3] dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-2 border border-transparent dark:border-gray-800">

        {/* LEFT PANEL */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-[#e6d3b1] dark:bg-gray-800 text-[#5b3a29] dark:text-gray-200 transition-colors">
          <div>
            <p className="text-sm opacity-80">Welcome to</p>

            <div className="flex items-center gap-3 mt-3">
              <div className="w-10 h-10 rounded-full bg-[#fffaf3] dark:bg-gray-900 flex items-center justify-center text-lg">
                ☁️
              </div>
              <h1 className="text-2xl font-bold dark:text-white">Planora</h1>
            </div>

            <p className="mt-6 text-sm leading-relaxed opacity-90">
              Organize your plans, manage your events, and keep everything in one place.
            </p>
          </div>

          <div className="text-xs opacity-60">
            © 2026 Planora · All rights reserved
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="p-8 md:p-12">
          <h2 className="text-2xl font-semibold text-[#5b3a29] dark:text-white">
            {state === 'sign up' ? 'Create your account' : 'Sign in'}
          </h2>

          <form onSubmit={onSubmitHandler} className="mt-6 space-y-4">

            {state === 'sign up' && (
              <div>
                <label className="block text-sm font-medium text-[#5b3a29] dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-[#d8c2ae] dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#c49a6c] dark:focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#5b3a29] dark:text-gray-300 mb-1">
                E-mail Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-[#d8c2ae] dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#c49a6c] dark:focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5b3a29] dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-[#d8c2ae] dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#c49a6c] dark:focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            {/* Role selection removed: Default to 'user' */}

            {/* FORGOT PASSWORD (SIGN IN ONLY) */}
            {state === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate('/reset-password')}
                  className="text-sm text-[#7a4a2e] dark:text-blue-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-md bg-[#7a4a2e] dark:bg-blue-600 text-white font-medium hover:bg-[#5b3a29] dark:hover:bg-blue-700 transition disabled:opacity-50"
            >
              {state === 'sign up' ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          {/* SWITCH */}
          <div className="mt-6 text-center text-sm text-[#7a5a45] dark:text-gray-400">
            {state === 'sign up'
              ? 'Already have an account?'
              : "Don't have an account?"}
            <button
              type="button"
              onClick={() => {
                setState(state === 'sign up' ? 'login' : 'sign up')
                setAccountType('user')
              }}
              className="ml-1 text-[#7a4a2e] dark:text-blue-400 font-medium hover:underline"
            >
              {state === 'sign up' ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
